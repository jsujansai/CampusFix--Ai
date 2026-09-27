import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export const AdminHeatmapView: React.FC = () => {
  const { reports, setSelectedReportId, setCurrentView } = useApp();

  // Aggregate issues by building/location
  const locationStats = useMemo(() => {
    const map: Record<string, { total: number; active: number; urgent: number; categories: Set<string> }> = {};

    reports.forEach(r => {
      const loc = r.building || r.location;
      if (!map[loc]) {
        map[loc] = { total: 0, active: 0, urgent: 0, categories: new Set() };
      }
      map[loc].total += 1;
      if (r.status !== 'Resolved') {
        map[loc].active += 1;
      }
      if (r.priority === 'Urgent') {
        map[loc].urgent += 1;
      }
      map[loc].categories.add(r.category);
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      active: data.active,
      urgent: data.urgent,
      categories: Array.from(data.categories),
      heatLevel: data.urgent > 0 ? 'critical' : data.active >= 2 ? 'high' : data.active === 1 ? 'moderate' : 'low'
    })).sort((a, b) => b.active - a.active || b.total - a.total);
  }, [reports]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Campus Issue Heatmap
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cluster analysis of high-frequency maintenance zones and repeat infrastructure failures across campus buildings.
        </p>
      </div>

      {/* Heatmap Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locationStats.map((loc) => {
          const isCritical = loc.heatLevel === 'critical';
          const isHigh = loc.heatLevel === 'high';
          const isModerate = loc.heatLevel === 'moderate';

          return (
            <div
              key={loc.name}
              className={`glass-card rounded-[28px] p-6 border transition-all space-y-4 ${
                isCritical
                  ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/20 shadow-md ring-1 ring-rose-500/20'
                  : isHigh
                  ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{loc.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {loc.categories.join(' • ')}
                  </p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isCritical
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                    : isHigh
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : isModerate
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {loc.heatLevel} Heat
                </span>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px]">Total</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{loc.total}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px]">Active</span>
                  <p className="text-lg font-bold text-blue-600 dark:text-cyan-400">{loc.active}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px]">Urgent</span>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{loc.urgent}</p>
                </div>
              </div>

              {/* Progress bar visual */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Maintenance Load</span>
                  <span>{loc.active > 0 ? `${loc.active} pending repair` : 'All resolved'}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, loc.active * 35))}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentView('map')}
                className="w-full py-2 px-3 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <span>View on Campus Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
