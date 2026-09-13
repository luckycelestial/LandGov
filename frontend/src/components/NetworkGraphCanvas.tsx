"use client";

import React, { useEffect, useRef } from "react";

interface NetworkGraphCanvasProps {
  nodes: any[];
  edges: any[];
  colorMode: "cluster" | "entity";
  clusters: any[];
  onNodeClick: (node: any) => void;
}

export default function NetworkGraphCanvas({
  nodes,
  edges,
  colorMode,
  clusters,
  onNodeClick,
}: NetworkGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined" || nodes.length === 0) return;

    let isMounted = true;

    import("vis-network/standalone").then(({ Network, DataSet }) => {
      if (!isMounted || !containerRef.current) return;

      // Map nodes with colors
      const visNodes = nodes.map((n) => {
        let bgColor = "#3B82F6";
        let borderColor = "#60A5FA";
        let fontColor = "#FFFFFF";

        if (colorMode === "cluster") {
          const clusterObj = clusters.find((c) => c.cluster_id === n.cluster_id);
          borderColor = clusterObj?.color?.border || n.cluster_color || "#3B82F6";
          bgColor = clusterObj?.color?.bg || "rgba(59, 130, 246, 0.4)";
          fontColor = "#FFFFFF";
        } else {
          switch (n.group) {
            case "LandParcel":
              bgColor = "#2563EB";
              borderColor = "#60A5FA";
              break;
            case "LandOwner":
              bgColor = "#059669";
              borderColor = "#34D399";
              break;
            case "DisputeCase":
              bgColor = "#E11D48";
              borderColor = "#FB7185";
              break;
            case "Court":
              bgColor = "#7C3AED";
              borderColor = "#A78BFA";
              break;
            case "Village":
              bgColor = "#D97706";
              borderColor = "#FBBF24";
              break;
            default:
              bgColor = "#475569";
              borderColor = "#94A3B8";
          }
        }

        return {
          id: n.id,
          label: n.label || n.id,
          title: n.title || n.label,
          group: n.group,
          cluster_id: n.cluster_id,
          shape: n.group === "DisputeCase" ? "diamond" : n.group === "LandParcel" ? "box" : "dot",
          size: n.group === "Court" ? 28 : 22,
          margin: { top: 8, bottom: 8, left: 10, right: 10 },
          color: {
            background: bgColor,
            border: borderColor,
            highlight: {
              background: "#F59E0B",
              border: "#FDE68A",
            },
            hover: {
              background: "#38BDF8",
              border: "#7DD3FC",
            },
          },
          font: {
            color: fontColor,
            size: 12,
            face: "system-ui",
            strokeWidth: 2,
            strokeColor: "#0B1120",
          },
          borderWidth: 2,
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.5)",
            size: 6,
            x: 2,
            y: 2,
          },
        };
      });

      // Map edges
      const visEdges = edges.map((e, idx) => ({
        id: `edge-${idx}`,
        from: e.from,
        to: e.to,
        label: e.label,
        font: {
          size: 10,
          color: "#94A3B8",
          strokeWidth: 2,
          strokeColor: "#0B1120",
          align: "middle",
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.7,
          },
        },
        color: {
          color: "rgba(148, 163, 184, 0.4)",
          highlight: "#F59E0B",
          hover: "#38BDF8",
        },
        smooth: {
          enabled: true,
          type: "cubicBezier",
          roundness: 0.3,
        },
        length: 160,
      }));

      const data = {
        nodes: new DataSet(visNodes),
        edges: new DataSet(visEdges),
      };

      const options = {
        nodes: {
          borderWidth: 2,
        },
        edges: {
          width: 1.5,
        },
        physics: {
          enabled: true,
          solver: "forceAtlas2Based",
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 120,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 0.8,
          },
          stabilization: {
            iterations: 150,
            updateInterval: 25,
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          hideEdgesOnDrag: false,
          zoomView: true,
          dragView: true,
          navigationButtons: false,
        },
      };

      if (networkRef.current) {
        networkRef.current.destroy();
      }

      const network = new Network(containerRef.current, data, options);
      networkRef.current = network;

      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const clickedId = params.nodes[0];
          const rawNode = nodes.find((n) => n.id === clickedId);
          if (rawNode) onNodeClick(rawNode);
        }
      });
    });

    return () => {
      isMounted = false;
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, colorMode, clusters]);

  return (
    <div className="relative w-full h-full min-h-[560px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
      {/* Background visual grid */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Network Canvas Mounting Container */}
      <div ref={containerRef} className="w-full h-full min-h-[560px]" />
    </div>
  );
}
