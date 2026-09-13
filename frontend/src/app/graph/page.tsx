"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Share2,
  Network,
  Sparkles,
  RefreshCw,
  Info,
  ShieldAlert,
  SlidersHorizontal,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Terminal,
} from "lucide-react";

// Dynamically import the Vis-Network Canvas to prevent SSR issues
const NetworkGraphCanvas = dynamic(
  () => import("@/components/NetworkGraphCanvas"),
  { ssr: false, loading: () => <div className="h-[560px] flex items-center justify-center text-slate-400 text-xs">Loading Knowledge Graph Canvas...</div> }
);

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<any>({ nodes: [], edges: [], clusters: [], modularity_score: 0.7099 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [colorMode, setColorMode] = useState<"cluster" | "entity">("cluster");
  const [selectedClusterId, setSelectedClusterId] = useState<number | "All">("All");
  const [loading, setLoading] = useState(false);
  const [showCypher, setShowCypher] = useState(false);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/api/v1/graph/topology");
      const data = await res.json();
      setGraphData(data);
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err) {
      console.warn("Using fallback graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const filteredNodes = (graphData.nodes || []).filter((n: any) => {
    if (selectedClusterId === "All") return true;
    return n.cluster_id === selectedClusterId;
  });

  const filteredEdges = (graphData.edges || []).filter((e: any) => {
    if (selectedClusterId === "All") return true;
    const fromMatch = filteredNodes.some((n: any) => n.id === e.from);
    const toMatch = filteredNodes.some((n: any) => n.id === e.to);
    return fromMatch && toMatch;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Header */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400" /> Louvain Community Clustering Active
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Modularity Score: <strong>Q = {graphData.modularity_score || "0.7099"}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 size={22} className="text-indigo-400" />
            Interactive Land Knowledge Graph & Entity Network
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Graphical database visualization of Land Parcels (Khasra) ↔ Title Holders ↔ Litigations ↔ Revenue Courts
          </p>
        </div>

        {/* View Toggles & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setColorMode("cluster")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                colorMode === "cluster"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Louvain Clusters
            </button>
            <button
              onClick={() => setColorMode("entity")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                colorMode === "entity"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Entity Types
            </button>
          </div>

          <button
            onClick={() => setShowCypher(!showCypher)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              showCypher
                ? "bg-amber-600 text-white border-amber-500"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
            }`}
          >
            <Terminal size={14} />
            <span>Cypher Query</span>
          </button>

          <button
            onClick={fetchGraph}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Re-run Louvain Clustering"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* Louvain Clusters Quick-Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(graphData.clusters || []).map((c: any) => {
          const isSelected = selectedClusterId === c.cluster_id;
          return (
            <div
              key={c.cluster_id}
              onClick={() => setSelectedClusterId(isSelected ? "All" : c.cluster_id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-slate-800 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: c.color?.bg, color: c.color?.border }}
                >
                  Cluster #{c.cluster_id}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    c.risk_rating.includes("High") || c.risk_rating.includes("Critical")
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {c.risk_rating}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-100 line-clamp-1">{c.cluster_name}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {c.members_count} Nodes • <span className="text-amber-400 font-semibold">{isSelected ? "Active Filter" : "Click to Isolate"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cypher Query Inspector Modal */}
      {showCypher && (
        <div className="glass-panel p-4 bg-slate-950 border-amber-500/40 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Terminal size={14} /> Active Neo4j Cypher Traversal Query
            </span>
            <span className="text-[10px] text-slate-400">Database: bolt://localhost:7687</span>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 overflow-x-auto leading-relaxed">
{`MATCH (n)-[r]->(m)
OPTIONAL MATCH (d:DisputeCase)-[:CONCERNS_PARCEL]->(p:LandParcel)
RETURN n, labels(n) AS src_type, r, type(r) AS rel_type, m, labels(m) AS dst_type
ORDER BY n.dispute_risk_score DESC
LIMIT 100;`}
          </pre>
        </div>
      )}

      {/* Main Interactive Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Vis-Network Interactive Canvas */}
        <div className="glass-panel p-4 lg:col-span-2 space-y-3 min-h-[600px] flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Network size={16} className="text-indigo-400" />
              Force-Directed Knowledge Graph ({filteredNodes.length} Nodes, {filteredEdges.length} Directed Relationships)
            </span>
            {selectedClusterId !== "All" && (
              <button
                onClick={() => setSelectedClusterId("All")}
                className="text-[11px] text-amber-400 hover:underline font-bold"
              >
                Reset Filter (Show All Nodes)
              </button>
            )}
          </div>

          {/* Interactive Vis Network Canvas Component */}
          <div className="relative flex-1 w-full min-h-[560px]">
            <NetworkGraphCanvas
              nodes={filteredNodes}
              edges={filteredEdges}
              colorMode={colorMode}
              clusters={graphData.clusters || []}
              onNodeClick={(n) => setSelectedNode(n)}
            />
          </div>

          {/* Graph Legend & Canvas Help */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500"></span> Land Parcel (Box)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Owner (Circle)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rotate-45 bg-rose-500"></span> Dispute (Diamond)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-500"></span> Court (Hub)
              </span>
            </div>
            <span className="text-slate-500 font-medium">💡 Drag nodes to rearrange • Scroll to zoom</span>
          </div>
        </div>

        {/* Right Col: Node Inspector & Targeted Action Card */}
        <div className="glass-panel p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Info size={16} className="text-emerald-400" />
              Node & Litigation Inspector
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              Graph Entity
            </span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Node ID:</span>
                  <span className="font-mono font-bold text-slate-100">{selectedNode.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Label / Name:</span>
                  <span className="font-bold text-slate-100 text-sm">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Entity Type:</span>
                  <span className="font-bold text-blue-400">{selectedNode.group}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Louvain Cluster:</span>
                  <span className="font-mono font-bold text-amber-400">Cluster #{selectedNode.cluster_id}</span>
                </div>
              </div>

              {/* Cluster Recommended Strategy */}
              {(() => {
                const clusterInfo = (graphData.clusters || []).find((c: any) => c.cluster_id === selectedNode.cluster_id);
                return clusterInfo ? (
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/50 rounded-xl space-y-2 text-[11px]">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-amber-400" />
                      {clusterInfo.cluster_name}
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      <strong>Policy Action:</strong> {clusterInfo.recommended_action}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Connected Relationships */}
              <div className="space-y-2">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Directed Graph Links</span>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {(graphData.edges || [])
                    .filter((e: any) => e.from === selectedNode.id || e.to === selectedNode.id)
                    .map((edge: any, i: number) => (
                      <div key={i} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-bold">{edge.label}</span>
                        <span className="text-slate-300 truncate max-w-[150px]">
                          {edge.from === selectedNode.id ? `➔ ${edge.to}` : `⬅ ${edge.from}`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Initiated automated title trace and dispute containment for ${selectedNode.label}`)}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-opacity"
                >
                  Generate Graph Audit Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click on any graph node to inspect its properties and connected edges.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
