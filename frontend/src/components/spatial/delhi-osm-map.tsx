'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DELHI_DISTRICTS_DATA, MOCK_VOLUNTEERS, DelhiDistrictStats, VolunteerMember } from '../../lib/data/delhi-data';
import { Layers, RotateCcw, ZoomIn, ZoomOut, CheckCircle2, UserCheck, Shield } from 'lucide-react';

interface DelhiOSMMapProps {
  selectedDistrict: string | null;
  onSelectDistrict: (districtName: string | null) => void;
  isLiveTracking?: boolean;
}

export function DelhiOSMMap({
  selectedDistrict,
  onSelectDistrict,
  isLiveTracking = true,
}: DelhiOSMMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const wardsLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [districtsGeoJSON, setDistrictsGeoJSON] = useState<any>(null);
  const [wardsGeoJSON, setWardsGeoJSON] = useState<any>(null);
  const [activeLayerType, setActiveLayerType] = useState<'districts' | 'wards' | 'all'>('districts');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch GeoJSONs on mount
  useEffect(() => {
    fetch('/delhi_districts.geojson')
      .then((res) => res.json())
      .then((data) => setDistrictsGeoJSON(data))
      .catch((err) => console.error('Failed to load delhi_districts.geojson', err));

    fetch('/delhi_wards.geojson')
      .then((res) => res.json())
      .then((data) => setWardsGeoJSON(data))
      .catch((err) => console.error('Failed to load delhi_wards.geojson', err));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    // Already initialized — nothing to do
    if (mapInstanceRef.current) return;

    // Track whether this effect invocation is still current.
    // React 18 StrictMode double-invokes effects; the cleanup sets this to
    // false so the async import callback can bail out if it resolves late.
    let isMounted = true;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // If Leaflet already attached itself to the container (e.g. StrictMode
      // first-pass didn't fully clean up), remove the stale _leaflet_id so
      // L.map() doesn't throw "Map container is already initialized".
      const container = mapContainerRef.current as any;
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      // Fix default marker icon issues in Webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current!, {
        center: [28.6250, 77.1500],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Attribution control in bottom right
      L.control.attribution({ position: 'bottomright', prefix: 'Leaflet | © OpenStreetMap contributors' }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Also clear the Leaflet internal marker from the DOM element so a
      // subsequent effect invocation gets a clean container.
      if (mapContainerRef.current) {
        const container = mapContainerRef.current as any;
        delete container._leaflet_id;
      }
    };
  }, []);

  // Render Districts & Wards Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !districtsGeoJSON) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Remove existing district layer if any
      if (geojsonLayerRef.current) {
        map.removeLayer(geojsonLayerRef.current);
      }
      if (wardsLayerRef.current) {
        map.removeLayer(wardsLayerRef.current);
      }

      // Add District Polygons
      const districtLayer = L.geoJSON(districtsGeoJSON, {
        style: (feature: any) => {
          const dtname = feature?.properties?.dtname || '';
          const stats = DELHI_DISTRICTS_DATA[dtname];
          const isSelected = selectedDistrict === dtname;

          let fillColor = stats ? stats.color : '#84cc16';
          let fillOpacity = isSelected ? 0.8 : 0.65;
          let weight = isSelected ? 3 : 1.5;
          let borderColor = isSelected ? '#1e293b' : '#334155';

          return {
            fillColor,
            fillOpacity,
            color: borderColor,
            weight,
            dashArray: isSelected ? undefined : '2, 2',
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const dtname = feature?.properties?.dtname || '';
          const stats = DELHI_DISTRICTS_DATA[dtname];

          // Tooltip
          layer.bindTooltip(
            `<div style="font-family: inherit; font-size: 11px;">
              <strong>${dtname} District</strong><br/>
              Coverage: ${stats?.coveragePct || 0}% (${stats?.coveredWards || 0}/${stats?.totalWards || 0} Wards)<br/>
              Active Volunteers: ${stats?.volunteersActive || 0}
            </div>`,
            { sticky: true, className: 'leaflet-custom-tooltip' }
          );

          layer.on({
            click: () => {
              onSelectDistrict(dtname);
              map.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 12 });
            },
            mouseover: () => {
              if (selectedDistrict !== dtname) {
                layer.setStyle({ fillOpacity: 0.85, weight: 2.5 });
              }
            },
            mouseout: () => {
              if (selectedDistrict !== dtname) {
                const stats = DELHI_DISTRICTS_DATA[dtname];
                layer.setStyle({ fillOpacity: 0.65, weight: 1.5 });
              }
            },
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = districtLayer;

      // If Ward mode or district selected, render ward boundaries
      if (wardsGeoJSON && (activeLayerType === 'wards' || selectedDistrict)) {
        const wardsLayer = L.geoJSON(wardsGeoJSON, {
          style: () => ({
            fillColor: 'transparent',
            color: '#1e3a8a',
            weight: 1,
            opacity: 0.5,
            dashArray: '3, 3',
          }),
          onEachFeature: (feature: any, layer: any) => {
            const wardName = feature?.properties?.Ward_Name || 'Ward';
            const wardNo = feature?.properties?.Ward_No || '';
            layer.bindTooltip(
              `<div style="font-size: 10px;"><strong>Ward: ${wardName}</strong> (${wardNo})</div>`,
              { sticky: true }
            );
          },
        }).addTo(map);

        wardsLayerRef.current = wardsLayer;
      }
    });
  }, [districtsGeoJSON, wardsGeoJSON, selectedDistrict, activeLayerType, mapLoaded, onSelectDistrict]);

  // Render Volunteer Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      if (markersLayerRef.current) {
        map.removeLayer(markersLayerRef.current);
      }

      const markersGroup = L.layerGroup();

      const filteredVolunteers = selectedDistrict
        ? MOCK_VOLUNTEERS.filter((v) => v.district === selectedDistrict)
        : MOCK_VOLUNTEERS;

      filteredVolunteers.forEach((v) => {
        let color = '#22c55e'; // green (Covered)
        if (v.status === 'Active') color = '#3b82f6'; // blue
        if (v.status === 'Inactive') color = '#6b7280'; // gray

        const customIcon = L.divIcon({
          className: 'custom-volunteer-pin',
          html: `<div style="
            width: 12px;
            height: 12px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 8px ${color};
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([v.lat, v.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong>${v.name}</strong><br/>
            <span style="color: #64748b;">${v.ward}</span><br/>
            <span>Status: <strong style="color: ${color};">${v.status}</strong></span><br/>
            <span>Tel: ${v.phone}</span><br/>
            <small style="color: #94a3b8;">Ping: ${v.lastPing}</small>
          </div>
        `);
        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);
      markersLayerRef.current = markersGroup;
    });
  }, [selectedDistrict, mapLoaded, isLiveTracking]);

  const handleResetView = () => {
    onSelectDistrict(null);
    if (mapInstanceRef.current && districtsGeoJSON && geojsonLayerRef.current) {
      mapInstanceRef.current.fitBounds(geojsonLayerRef.current.getBounds(), { padding: [20, 20] });
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-full bg-[#e8ecef] overflow-hidden flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {/* Header Inside Map Card */}
      <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              DELHI NCT — BOUNDARY MAPPER
            </h3>
            {selectedDistrict && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                {selectedDistrict} District Selected
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Click on district boundary polygons to zoom and view volunteers & 290 ward-level boundaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedDistrict && (
            <button
              onClick={handleResetView}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>All Delhi</span>
            </button>
          )}

          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setActiveLayerType('districts')}
              className={`px-2 py-0.5 rounded ${
                activeLayerType === 'districts'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Districts (11)
            </button>
            <button
              onClick={() => setActiveLayerType('wards')}
              className={`px-2 py-0.5 rounded ${
                activeLayerType === 'wards'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Wards (290)
            </button>
          </div>

          <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            DELHI_NCT
          </span>
        </div>
      </div>

      {/* Map Element */}
      <div className="relative flex-1 w-full h-full min-h-[480px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Custom Zoom Controls Top-Left */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1 shadow-md rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 font-bold text-base"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-base"
            title="Zoom out"
          >
            -
          </button>
        </div>

        {/* Bottom-Left Floating Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-xl text-[10px] space-y-2.5 max-w-[170px]">
          <div>
            <div className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[9px] mb-1.5 font-mono">
              Coverage Status
            </div>
            <div className="space-y-1 text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[#22c55e] flex-shrink-0" />
                <span>Fully covered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[#f97316] flex-shrink-0" />
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[#ef4444] flex-shrink-0" />
                <span>Not started</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[9px] mb-1.5 font-mono">
              Volunteers
            </div>
            <div className="space-y-1 text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] flex-shrink-0" />
                <span>Covered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] flex-shrink-0" />
                <span>Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6b7280] flex-shrink-0" />
                <span>Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
