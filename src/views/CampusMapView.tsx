import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { BuildingHotspot, Report } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Building
} from 'lucide-react';

export const CampusMapView: React.FC = () => {
  const { reports, setSelectedReportId, setCurrentView } = useApp();

  const [hotspots, setHotspots] = useState<BuildingHotspot[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingHotspot | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        setLoading(true);
        const res = await api.getMapHotspots();
        setHotspots(res.buildings);
        if (res.buildings.length > 0) {
          setSelectedBuilding(res.buildings[0]);
        }
      } catch (err) {
        console.error('Failed to fetch map hotspots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  // Reports associated with the currently selected building
  const buildingReports = selectedBuilding
    ? reports.filter(r => r.building.toLowerCase().includes(selectedBuilding.name.toLowerCase().slice(0, 8)) || r.location.toLowerCase().includes(selectedBuilding.name.toLowerCase().slice(0, 8)))
    : [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              Smart Campus Geospatial Map
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] mt-1">
            Interactive Campus Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time visualization of infrastructure tickets, active repair crews, and campus facilities.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300">Urgent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">Resolved</span>
          </div>
        </div>
      </div>

      {/* MAP CANVAS & BUILDING DETAILS DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAP CANVAS (2 COLS) */}
        <div className="lg:col-span-2 glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 overflow-hidden relative min-h-[460px] flex flex-col justify-between">
          
          {/* Top Canvas Controls */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Building Pin to Inspect</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                  filterMode === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('active')}
                className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                  filterMode === 'active' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Active Only
              </button>
            </div>
          </div>

          {/* Map Graphic Area with SVG Layout and Hotspot Pins */}
          <div className="relative w-full h-[380px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800">
            {/* Campus Pathways Grid SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-slate-600" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#campus-grid)" />
              {/* Connecting pedestrian paths */}
              <path d="M 18% 25% L 50% 55% L 65% 30% L 35% 40% Z" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="6,6" opacity="0.4" />
              <path d="M 50% 12% L 50% 55% L 82% 65%" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6,6" opacity="0.4" />
              <path d="M 25% 70% L 50% 55%" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="6,6" opacity="0.4" />
            </svg>

            {/* Hotspot Markers */}
            {hotspots.map((b) => {
              const isSelected = selectedBuilding?.id === b.id;
              const hasActive = b.activeIssues > 0;
              const pinColor = hasActive
                ? b.name.includes('Hostel')
                  ? 'bg-rose-500' // Urgent
                  : 'bg-blue-600' // In progress
                : 'bg-emerald-500'; // All good / resolved

              if (filterMode === 'active' && b.activeIssues === 0) return null;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBuilding(b)}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Pin Graphic */}
                  <div className={`relative flex items-center justify-center transition-transform duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}>
                    <div className={`w-8 h-8 rounded-full ${pinColor} text-white shadow-xl flex items-center justify-center font-extrabold text-xs ring-4 ring-white dark:ring-slate-900`}>
                      {b.activeIssues > 0 ? b.activeIssues : '✓'}
                    </div>

                    {/* Pulse ring for active issues */}
                    {b.activeIssues > 0 && (
                      <span className={`absolute w-10 h-10 rounded-full ${pinColor} opacity-40 animate-ping pointer-events-none`} />
                    )}
                  </div>

                  {/* Building Label Tag */}
                  <div className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-center whitespace-nowrap shadow-md transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-blue-500'
                      : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {b.name}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-[11px] text-slate-400 text-center">
            Tip: Interactive pins update dynamically based on live reported tickets and repairs.
          </div>
        </div>

        {/* RIGHT COL: BUILDING INSPECTOR & REPORT LIST */}
        <div className="space-y-4">
          {selectedBuilding ? (
            <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  {selectedBuilding.type}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {selectedBuilding.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedBuilding.description}
                </p>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">Active Issues</span>
                  <p className="text-xl font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5">
                    {selectedBuilding.activeIssues}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">Resolved This Month</span>
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedBuilding.resolvedIssues}
                  </p>
                </div>
              </div>

              {/* List of complaints in this building */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Building Tickets ({buildingReports.length})
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {buildingReports.map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReportId(rep.id)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {rep.id}
                        </span>
                        <StatusBadge status={rep.status} size="sm" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {rep.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rep.roomOrArea || rep.location}</p>
                    </div>
                  ))}

                  {buildingReports.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No active tickets recorded at {selectedBuilding.name}. Everything is in great shape!
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setCurrentView('report')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue at this Building</span>
              </button>
            </div>
          ) : null}
        </div>

      </div>

    </div>
  );
};
