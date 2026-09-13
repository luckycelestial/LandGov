"use client";

import React, { useEffect, useRef, useState } from "react";

interface Parcel {
  id: number;
  khasra_no: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  area_acres: number;
  land_use: string;
  owner_name: string;
  title_status: string;
  svamitva_issued: boolean;
  is_digitized: boolean;
  lat: number;
  lng: number;
  dispute_risk_score: number;
  climate_vulnerability_index: number;
  last_mutation_date?: string;
}

interface CadastralLeafletMapProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  activeThematicLayer: "cadastral" | "dispute_heat" | "climate";
}

export default function CadastralLeafletMap({
  parcels,
  selectedParcel,
  onSelectParcel,
  selectedDistrict,
  onSelectDistrict,
  activeThematicLayer,
}: CadastralLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [activeGeoType, setActiveGeoType] = useState<"districts" | "constituencies" | "wards">("districts");
  const [baseTile, setBaseTile] = useState<"dark" | "satellite" | "osm">("dark");
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load GeoJSON datasets
  useEffect(() => {
    let url = "/delhi_districts.geojson";
    if (activeGeoType === "constituencies") url = "/delhi_constituencies.geojson";
    if (activeGeoType === "wards") url = "/delhi_wards.geojson";

    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => {
        if (geo) setGeojsonData(geo);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed loading GeoJSON:", err);
        setLoading(false);
      });
  }, [activeGeoType]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const L = require("leaflet");

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.209],
        zoom: 11,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Tile layers
    if ((map as any)._currentTileLayer) {
      map.removeLayer((map as any)._currentTileLayer);
    }

    let tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a> | Survey of India Cadastral';

    if (baseTile === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';
    } else if (baseTile === "osm") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';
    }

    const tileLayer = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
    (map as any)._currentTileLayer = tileLayer;
  }, [baseTile]);

  // Render GeoJSON Choropleth & Boundary
  useEffect(() => {
    if (!mapInstanceRef.current || !geojsonData) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    // Remove existing geojson layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    // Color mapper based on metric & district name
    const getFeatureColor = (feature: any) => {
      const name = feature.properties.dtname || feature.properties.AC_NAME || feature.properties.Ward_Name || "";
      
      if (activeThematicLayer === "dispute_heat") {
        if (name.includes("South West") || name.includes("Najafgarh") || name.includes("Matiala")) return "#f43f5e"; // Critical
        if (name.includes("South") || name.includes("Mehrauli") || name.includes("Sangam")) return "#f59e0b"; // High
        if (name.includes("East") || name.includes("Shahdara")) return "#8b5cf6"; // Medium
        return "#3b82f6"; // Low
      }

      if (activeThematicLayer === "climate") {
        if (name.includes("South") || name.includes("Ridge")) return "#10b981";
        if (name.includes("North") || name.includes("Alipur")) return "#06b6d4";
        return "#6366f1";
      }

      const isSelected = selectedDistrict !== "All" && name.toLowerCase().includes(selectedDistrict.toLowerCase());
      if (isSelected) return "#38bdf8";
      return "#334155";
    };

    const layer = L.geoJSON(geojsonData, {
      style: (feature: any) => {
        const name = feature.properties.dtname || feature.properties.AC_NAME || feature.properties.Ward_Name || "";
        const isSelected = selectedDistrict !== "All" && name.toLowerCase().includes(selectedDistrict.toLowerCase());
        const color = getFeatureColor(feature);

        return {
          fillColor: color,
          weight: isSelected ? 3 : 1.5,
          opacity: 0.9,
          color: isSelected ? "#38bdf8" : "#64748b",
          dashArray: isSelected ? "" : "2",
          fillOpacity: isSelected ? 0.65 : 0.35,
        };
      },
      onEachFeature: (feature: any, featureLayer: any) => {
        const name =
          feature.properties.dtname ||
          feature.properties.AC_NAME ||
          feature.properties.Ward_Name ||
          "Cadastral Zone";

        featureLayer.bindTooltip(
          `<div style="font-family: inherit;">
            <div style="font-weight: 700; color: #38bdf8;">${name}</div>
            <div style="color: #cbd5e1; font-size: 10px; margin-top: 2px;">
              ${activeGeoType === "districts" ? "District Administrative Boundary" : activeGeoType === "constituencies" ? "Assembly Constituency" : "Municipal Ward"}
            </div>
            <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">Click to filter & zoom</div>
          </div>`,
          { sticky: true, className: "custom-geo-tooltip" }
        );

        featureLayer.on({
          mouseover: (e: any) => {
            const l = e.target;
            l.setStyle({
              weight: 3,
              color: "#38bdf8",
              fillOpacity: 0.6,
            });
            l.bringToFront();
          },
          mouseout: (e: any) => {
            layer.resetStyle(e.target);
          },
          click: (e: any) => {
            if (feature.properties.dtname) {
              onSelectDistrict(feature.properties.dtname);
            }
            map.fitBounds(e.target.getBounds(), { padding: [30, 30] });
          },
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = layer;
  }, [geojsonData, activeThematicLayer, selectedDistrict, activeGeoType]);

  // Render Parcel Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    const markersGroup = L.layerGroup();

    parcels.forEach((p) => {
      const isSelected = selectedParcel?.id === p.id;
      const isDisputed = p.title_status === "Disputed";
      const isMutation = p.title_status === "Under-Mutation";

      const badgeColor = isDisputed ? "#f43f5e" : isMutation ? "#8b5cf6" : "#10b981";
      const iconHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? "34px" : "26px"};
          height: ${isSelected ? "34px" : "26px"};
          background: ${isSelected ? "#38bdf8" : badgeColor};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 14px ${badgeColor};
          cursor: pointer;
          transition: transform 0.2s;
          font-weight: 900;
          font-size: 11px;
          color: #ffffff;
        ">
          ${isDisputed ? "⚠️" : isMutation ? "⏳" : "✓"}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-khasra-pin",
        iconSize: [isSelected ? 34 : 26, isSelected ? 34 : 26],
        iconAnchor: [isSelected ? 17 : 13, isSelected ? 17 : 13],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="min-width: 180px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            Khasra No: ${p.khasra_no}
          </div>
          <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1;">
            <div><strong>Village:</strong> ${p.village}</div>
            <div><strong>District:</strong> ${p.district}</div>
            <div><strong>Area:</strong> ${p.area_acres} Acres</div>
            <div><strong>Owner:</strong> ${p.owner_name}</div>
            <div><strong>Status:</strong> <span style="color: ${badgeColor}; font-weight: 700;">${p.title_status}</span></div>
            <div><strong>Dispute Risk:</strong> ${p.dispute_risk_score}%</div>
          </div>
        </div>
      `);

      marker.on("click", () => {
        onSelectParcel(p);
      });

      markersGroup.addLayer(marker);
    });

    markersGroup.addTo(map);
    markersLayerRef.current = markersGroup;

    if (selectedParcel) {
      map.panTo([selectedParcel.lat, selectedParcel.lng], { animate: true });
    }
  }, [parcels, selectedParcel]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([28.6139, 77.209], 11);
      onSelectDistrict("All");
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* Top Overlay Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        {/* GeoJSON Boundary Switcher */}
        <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl">
          <button
            onClick={() => setActiveGeoType("districts")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeGeoType === "districts"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Districts GeoJSON
          </button>
          <button
            onClick={() => setActiveGeoType("constituencies")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeGeoType === "constituencies"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Constituencies GeoJSON
          </button>
          <button
            onClick={() => setActiveGeoType("wards")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeGeoType === "wards"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Wards GeoJSON
          </button>
        </div>

        {/* Base Tile Selector */}
        <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl">
          <button
            onClick={() => setBaseTile("dark")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              baseTile === "dark" ? "bg-slate-700 text-cyan-300" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dark Carto
          </button>
          <button
            onClick={() => setBaseTile("satellite")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              baseTile === "satellite" ? "bg-slate-700 text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setBaseTile("osm")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              baseTile === "osm" ? "bg-slate-700 text-amber-300" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Roads
          </button>
        </div>
      </div>

      {/* Reset Bounds Action Button */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleResetView}
          className="bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold shadow-xl transition-all flex items-center gap-1.5"
        >
          <span>🎯 Reset Delhi Bounds</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 shadow-2xl">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            Loading Cadastral GeoJSON Layer...
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span>Clear Title (SVAMITVA)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
          <span>Litigation / Encroached</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
          <span>Succession Mutation</span>
        </div>
      </div>

      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
