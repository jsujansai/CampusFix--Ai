import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { StatsSummary } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { 
  Building2, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Sparkles, 
  ArrowRight,
  Flame,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { reports, setSelectedReportId, setCurrentView, user } = useApp();

  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getStatsSummary(user);
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [reports, user]);

  const urgentReports = reports.filter(r => r.priority === 'Urgent' && r.status !== 'Resolved');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Admin Operations Hero */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-900/40">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Infrastructure Operations Live</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Campus Operations Center
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Welcome, {user?.name || 'Administrator'}. Monitor facilities maintenance, dispatch specialized crews, and optimize campus health in real time.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => setCurrentView('admin-reports')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Manage All Tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentView('admin-students')}
                className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-white font-bold text-xs rounded-xl border border-blue-400/40 transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                <span>Students & Logins</span>
              </button>

              <button
                onClick={() => setCurrentView('admin-departments')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Department Crews
              </button>
            </div>
          </div>

          {/* Quick Mascot/Operations Badge */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/src/assets/images/ai_fix_mascot_1790383722304.jpg"
              alt="Operations Mascot"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-cyan-500/30 shadow-2xl animate-subtle-float"
            />
          </div>
        </div>
      </div>

      {/* METRICS ROW (Prompt: Total, Pending, In Progress, Resolved, Urgent) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all"
        >
          <span className="text-xs text-slate-400 font-medium">Total Issues</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {stats?.admin.total ?? reports.length}
          </p>
          <span className="text-[10px] text-slate-400">All campus tickets</span>
        </div>

        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all"
        >
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pending Review</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {stats?.admin.pending ?? reports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length}
          </p>
          <span className="text-[10px] text-slate-400">Awaiting dispatch</span>
        </div>

        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all"
        >
          <span className="text-xs text-blue-600 dark:text-cyan-400 font-medium">In Progress</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 mt-1">
            {stats?.admin.inProgress ?? reports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length}
          </p>
          <span className="text-[10px] text-slate-400">Crews active</span>
        </div>

        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all"
        >
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.admin.resolved ?? reports.filter(r => r.status === 'Resolved').length}
          </p>
          <span className="text-[10px] text-slate-400">Completed & checked</span>
        </div>

        <div 
          onClick={() => setCurrentView('admin-reports')}
          className="glass-card p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 cursor-pointer hover:shadow-md transition-all col-span-2 sm:col-span-1"
        >
          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Urgent</span>
          </span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {stats?.admin.urgent ?? urgentReports.length}
          </p>
          <span className="text-[10px] text-rose-500 font-semibold">Priority dispatch</span>
        </div>
      </div>

      {/* URGENT PRIORITY DISPATCH ALERT BANNER (If any urgent issues) */}
      {urgentReports.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-200">
                Action Required: {urgentReports.length} Urgent Safety/Infrastructure Ticket(s) Open
              </p>
              <p className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                {urgentReports[0].title} in {urgentReports[0].location}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedReportId(urgentReports[0].id)}
            className="px-3.5 py-1.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm shrink-0"
          >
            Dispatch Crew Now →
          </button>
        </div>
      )}

      {/* CHARTS & WORKLOAD BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Issues by Category */}
        <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Issues by Category
            </h3>
            <span className="text-xs text-slate-400">Live breakdown</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats?.admin.categoryCounts || {}).map(([cat, count]) => {
              const total = stats?.admin.total || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Workload */}
        <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Department Workload
            </h3>
            <button
              onClick={() => setCurrentView('admin-departments')}
              className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {(stats?.admin.deptWorkload || []).map((dept) => {
              return (
                <div key={dept.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{dept.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{dept.resolvedTickets} resolved this semester</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {dept.openTickets} Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
