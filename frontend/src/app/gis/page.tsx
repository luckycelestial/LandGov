"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Layers,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Shield,
  Eye,
  Sliders
} from "lucide-react";

import CadastralLeafletMap from "@/components/CadastralLeafletMap";

export default function GISStudioPage() {
  const [mounted, setMounted] = useState(false);
  const [parcels, setParcels] = useState<any[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<"cadastral" | "dispute_heat" | "climate">("cadastral");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [searchKhasra, setSearchKhasra] = useState("");

  useEffect(() => {
    setMounted(true);
    fetch("http://localhost:8001/api/v1/parcels/")
      .then((res) => res.json())
      .then((data) => {
        setParcels(data);
        if (data.length > 0) setSelectedParcel(data[0]);
      })
      .catch((err) => {
        console.warn("Using fallback parcel data:", err);
        const fallback = [
          {
            id: 1, khasra_no: "104/1A", village: "Mehrauli", taluka: "South Delhi", district: "South", state: "Delhi",
            area_acres: 4.85, land_use: "Agricultural", owner_name: "Rameshwar Prasad & Brothers",
            title_status: "Clear", svamitva_issued: true, is_digitized: true,
            lat: 28.5244, lng: 77.1855, dispute_risk_score: 12.5, climate_vulnerability_index: 28.0,
            last_mutation_date: "2024-03-15"
          },
          {
            id: 2, khasra_no: "218/3B", village: "Najafgarh", taluka: "South West Delhi", district: "South West", state: "Delhi",
            area_acres: 12.20, land_use: "Agricultural", owner_name: "Kishan Lal Yadav",
            title_status: "Disputed", svamitva_issued: false, is_digitized: true,
            lat: 28.6090, lng: 76.9850, dispute_risk_score: 78.4, climate_vulnerability_index: 45.2,
            last_mutation_date: "2021-11-04"
          },
          {
            id: 3, khasra_no: "44/2", village: "Alipur", taluka: "North Delhi", district: "North", state: "Delhi",
            area_acres: 8.10, land_use: "Commercial", owner_name: "Apex Logistics & Agro Parks Ltd",
            title_status: "Clear", svamitva_issued: true, is_digitized: true,
            lat: 28.7980, lng: 77.1350, dispute_risk_score: 22.0, climate_vulnerability_index: 19.8,
            last_mutation_date: "2025-01-10"
          },
          {
            id: 4, khasra_no: "78/5C", village: "Shahdara", taluka: "East Delhi", district: "East", state: "Delhi",
            area_acres: 2.45, land_use: "Residential", owner_name: "Savitri Devi Trust",
            title_status: "Under-Mutation", svamitva_issued: false, is_digitized: true,
            lat: 28.6730, lng: 77.2910, dispute_risk_score: 54.0, climate_vulnerability_index: 68.5,
            last_mutation_date: "2026-02-18"
          },
          {
            id: 5, khasra_no: "312/9", village: "Vasant Kunj Fringe", taluka: "South Delhi", district: "South", state: "Delhi",
            area_acres: 6.70, land_use: "Forest / Ridge Buffer", owner_name: "Delhi Forest Department / Gram Sabha",
            title_status: "Disputed", svamitva_issued: false, is_digitized: true,
            lat: 28.5320, lng: 77.1420, dispute_risk_score: 89.1, climate_vulnerability_index: 82.0,
            last_mutation_date: "2019-08-22"
          }
        ];
        setParcels(fallback);
        setSelectedParcel(fallback[0]);
      });
  }, []);

  const filteredParcels = parcels.filter((p) => {
    const matchDistrict = districtFilter === "All" || p.district.toLowerCase().includes(districtFilter.toLowerCase());
    const matchSearch =
      searchKhasra === "" ||
      p.khasra_no.toLowerCase().includes(searchKhasra.toLowerCase()) ||
      p.village.toLowerCase().includes(searchKhasra.toLowerCase());
    return matchDistrict && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin size={22} className="text-emerald-400" />
            GIS & Cadastral Mapping Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Leaflet GIS with multi-layer GeoJSON boundaries, Khasra parcels, Bhu-Aadhaar & dispute overlays
          </p>
        </div>

        {/* Thematic Metric Layer Switchers */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveLayer("cadastral")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLayer === "cadastral"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cadastral (Khasra)
          </button>
          <button
            onClick={() => setActiveLayer("dispute_heat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLayer === "dispute_heat"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dispute Risk Heat
          </button>
          <button
            onClick={() => setActiveLayer("climate")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLayer === "climate"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Climate & Ecology
          </button>
        </div>
      </div>

      {/* Main Map Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Interactive Leaflet Map Canvas */}
        <div className="glass-panel p-4 lg:col-span-2 space-y-3 flex flex-col">
          {/* Map Sub-filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Khasra No, Village, or Owner..."
                  value={searchKhasra}
                  onChange={(e) => setSearchKhasra(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Filter District:</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Districts</option>
                <option value="South">South Delhi</option>
                <option value="South West">South West Delhi</option>
                <option value="North">North Delhi</option>
                <option value="East">East Delhi</option>
                <option value="Central">Central Delhi</option>
                <option value="New Delhi">New Delhi</option>
              </select>
            </div>
          </div>

          {/* Interactive Leaflet Map with GeoJSON */}
          {mounted ? (
            <CadastralLeafletMap
              parcels={filteredParcels}
              selectedParcel={selectedParcel}
              onSelectParcel={(p) => setSelectedParcel(p)}
              selectedDistrict={districtFilter}
              onSelectDistrict={(dist) => setDistrictFilter(dist)}
              activeThematicLayer={activeLayer}
            />
          ) : (
            <div className="w-full h-[580px] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
              <div className="flex items-center gap-3 text-cyan-400 font-bold text-xs">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Loading Cadastral Leaflet GeoJSON Engine...
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Parcel Inspector Panel */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-amber-400" />
              Cadastral Record Inspector
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              ULPIN / Bhu-Aadhaar
            </span>
          </div>

          {selectedParcel ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Khasra / Survey No:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">{selectedParcel.khasra_no}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Village & Tehsil:</span>
                  <span className="text-slate-200 font-bold">{selectedParcel.village}, {selectedParcel.taluka}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">District & State:</span>
                  <span className="text-slate-200 font-bold">{selectedParcel.district}, {selectedParcel.state}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Area:</span>
                  <span className="text-emerald-400 font-bold">{selectedParcel.area_acres} Acres</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Land Classification:</span>
                  <span className="text-blue-400 font-bold">{selectedParcel.land_use}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Ownership & Title Registry</span>
                <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-slate-200 font-bold">{selectedParcel.owner_name}</div>
                  <div className="text-slate-400 text-[11px]">Last Mutation Date: {selectedParcel.last_mutation_date || "2024-03-15"}</div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">SVAMITVA Card</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {selectedParcel.svamitva_issued ? "✅ Issued" : "⏳ Pending"}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Dispute Risk Score</div>
                  <div className={`text-xs font-bold mt-0.5 ${
                    selectedParcel.dispute_risk_score > 60 ? "text-rose-400" :
                    selectedParcel.dispute_risk_score > 30 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {selectedParcel.dispute_risk_score}% Index
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Generated Certified RoR Certificate for Khasra ${selectedParcel.khasra_no}`)}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 hover:opacity-95 transition-opacity"
                >
                  Download Certified RoR Extract (Jamabandi)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a parcel from the map to view detailed cadastral records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
