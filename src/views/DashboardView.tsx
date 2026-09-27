import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Award,
  ChevronRight,
  Wifi,
  Zap,
  ArrowUpRight,
  AlertTriangle,
  Hammer
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    user, 
    reports, 
    setCurrentView, 
    setSelectedReportId, 
    setTrackingTicketId,
    startQuickReport
  } = useApp();

  const myReports = user ? reports.filter(r => r.reporterId === user.id) : [];
  const pendingCount = myReports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
  const inProgressCount = myReports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
  const resolvedCount = myReports.filter(r => r.status === 'Resolved').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* HERO BANNER: 3D Student Visual, Greeting & Quick CTA */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15">
        {/* Subtle background overlay */}
        <div 
          className="absolute inset-0 opacity-15 mix-blend-overlay bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('/src/assets/images/campus_environment_1790383710501.jpg')` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Smart Campus Operations Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>

            <p className="mt-2 text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              Let's make your campus better together. Report a broken light, Wi-Fi outage, or water leak in under 30 seconds.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => setCurrentView('report')}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>Quick Report Issue</span>
              </button>

              <button
                onClick={() => setCurrentView('track')}
                className="px-4 py-2.5 bg-blue-800/40 hover:bg-blue-800/60 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-cyan-200" />
                <span>Track By Ticket ID</span>
              </button>
            </div>
          </div>

          {/* Large Friendly 3D Student Avatar */}
          <div className="relative shrink-0">
            <div className="relative group">
              <img
                src="/src/assets/images/campus_hero_student_1790383682884.jpg"
                alt="Student Hero"
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover shadow-2xl ring-4 ring-white/30 transform group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute -bottom-2 -left-2 glass-card px-3 py-1.5 rounded-xl shadow-lg border border-white/40 flex items-center gap-2 text-slate-800 animate-subtle-float">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-extrabold text-slate-900">Level 3 Campus Helper</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION: Fast 1-Click Common Report Category Shortcuts */}
      <section aria-labelledby="quick-actions-heading" className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="quick-actions-heading" className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight font-['Space_Grotesk']">
                  Quick Actions
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-blue-800/60">
                  Instant Triage
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shortcut buttons to speed up reporting common campus issues
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('report')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors"
          >
            <span>Custom Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcut Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Shortcut 1: Maintenance */}
          <button
            type="button"
            onClick={() => startQuickReport('Maintenance', 'Medium')}
            className="group relative text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  Facilities
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Maintenance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Plumbing leaks, broken lights, door handles, classroom AC & fixtures.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5" />
                <span>Fix Facilities</span>
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Shortcut 2: IT Support */}
          <button
            type="button"
            onClick={() => startQuickReport('IT Support', 'Medium')}
            className="group relative text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500 shadow-xs hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Wifi className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-blue-800/60">
                  Tech / Network
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                IT Support
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Campus Wi-Fi outages, lab computers, classroom projectors & audio.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Report IT Issue</span>
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Shortcut 3: Safety */}
          <button
            type="button"
            onClick={() => startQuickReport('Safety', 'High')}
            className="group relative text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-xs hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 animate-pulse">
                  High Priority
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Safety
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Broken glass, hazardous wiring, dark pathways, slippery floor & security.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Alert Campus Team</span>
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Shortcut 4: Cleanliness / Sanitation */}
          <button
            type="button"
            onClick={() => startQuickReport('Cleanliness', 'Low')}
            className="group relative text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  Hygiene
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Cleanliness
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Trash overflow, restroom hygiene, hazardous spills & cafeteria sanitation.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Cleanup</span>
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

        </div>
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reports */}
        <div 
          onClick={() => setCurrentView('reports')}
          className="glass-card p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Reports</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              📂
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {myReports.length}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Total tickets filed</p>
          </div>
        </div>

        {/* Pending */}
        <div 
          onClick={() => setCurrentView('reports')}
          className="glass-card p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Under dispatch review</p>
          </div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => setCurrentView('reports')}
          className="glass-card p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-cyan-400">
              {inProgressCount}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Technicians on site</p>
          </div>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => setCurrentView('reports')}
          className="glass-card p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {resolvedCount}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Fixed & confirmed</p>
          </div>
        </div>

      </div>

      {/* TWO COLUMN CONTENT: Recent Reports & Campus Live Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: Recent Reports Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent Reports</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Status and progress of reported problems</p>
            </div>
            <button
              onClick={() => setCurrentView('reports')}
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myReports.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center border border-slate-200/70 dark:border-slate-800/80 space-y-2">
                <span className="text-3xl block">🌱</span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Reports Filed Yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Notice any broken campus lights, classroom issues, or plumbing leaks? Submit your first report to earn helper points!
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('report')}
                  className="mt-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Report First Issue →
                </button>
              </div>
            ) : (
              myReports.slice(0, 4).map((rep) => {
                // Calculate progress percentage
                let progress = 20;
                if (rep.status === 'Under Review') progress = 35;
                if (rep.status === 'Assigned') progress = 55;
                if (rep.status === 'In Progress') progress = 75;
                if (rep.status === 'Resolved') progress = 100;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className="glass-card p-4 rounded-2xl hover:shadow-md transition-all cursor-pointer border border-slate-200/70 dark:border-slate-800/80 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {rep.imageUrl ? (
                          <img
                            src={rep.imageUrl}
                            alt={rep.title}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                            🛠️
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {rep.id}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {rep.category}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {rep.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{rep.location}</span>
                            <span>•</span>
                            <span>{new Date(rep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={rep.status} size="sm" />
                        <PriorityBadge priority={rep.priority} size="sm" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Resolution Progress</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            rep.status === 'Resolved'
                              ? 'bg-emerald-500'
                              : rep.priority === 'Urgent'
                              ? 'bg-rose-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COL: Campus Activity & AI Insights */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">CampusFix AI Assistant</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Need immediate triage or not sure which department handles a safety issue?
            </p>
            <button
              onClick={() => setCurrentView('ai-assistant')}
              className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <span>Ask AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Campus Map Teaser */}
          <div 
            onClick={() => setCurrentView('map')}
            className="glass-card p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all border border-slate-200/70 dark:border-slate-800/80 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Hotspot Map</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Explore buildings and see real-time maintenance status across campus.
            </p>
            <div className="relative h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img
                src="/src/assets/images/campus_environment_1790383710501.jpg"
                alt="Map Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-xs font-bold text-white bg-slate-900/70 px-3 py-1.5 rounded-lg border border-white/20">
                  Open Interactive Map →
                </span>
              </div>
            </div>
          </div>

          {/* Quick Rewards Pill */}
          <div 
            onClick={() => setCurrentView('rewards')}
            className="glass-card p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold">
                🏆
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Your Campus Impact</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.points || 0} Points • 4 Badges</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

        </div>

      </div>

    </div>
  );
};
