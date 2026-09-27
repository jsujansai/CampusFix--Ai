import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { LeaderboardUser } from '../types';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  HeartHandshake, 
  Star,
  Users,
  ArrowRight
} from 'lucide-react';

const badgesList = [
  {
    name: 'Campus Helper',
    icon: '🌱',
    desc: 'Submit first verified campus issue',
    unlocked: true,
  },
  {
    name: 'Problem Solver',
    icon: '⚡',
    desc: '3 or more tickets resolved & verified',
    unlocked: true,
  },
  {
    name: 'Community Champion',
    icon: '🏆',
    desc: 'Earn over 400 contribution points',
    unlocked: true,
  },
  {
    name: 'Campus Guardian',
    icon: '🛡️',
    desc: 'Report an urgent water or electrical hazard',
    unlocked: false,
  },
];

export const RewardsView: React.FC = () => {
  const { user, reports, setCurrentView } = useApp();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.getLeaderboard();
        setLeaderboard(res.leaderboard);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [reports]);

  const userReports = user ? reports.filter(r => r.reporterId === user.id) : [];
  const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/15">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Student Community Impact Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Make a Difference 🌱
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Every report you lodge keeps lecture halls bright, laboratories safe, and campus clean. Earn contribution points and claim community honors!
            </p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => setCurrentView('report')}
                className="px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                + Report to Earn +50 Pts
              </button>
            </div>
          </div>

          <div className="shrink-0 text-center glass-card px-6 py-4 rounded-3xl border border-white/30 text-slate-900 dark:text-white">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Your Score</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {user?.points || 0}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Contribution Points</span>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Contribution Points</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {user?.points || 0}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">+75 this week</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Reports Submitted</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 mt-1">
            {userReports.length}
          </p>
          <span className="text-[10px] text-slate-400">Active engagement</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Issues Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedCount}
          </p>
          <span className="text-[10px] text-slate-400">Verified by crews</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Campus Impact</span>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">
            Top 5%
          </p>
          <span className="text-[10px] text-slate-400">Ranked across college</span>
        </div>
      </div>

      {/* TWO COLUMNS: BADGES & REAL LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Badges */}
        <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Earned & Available Badges
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badgesList.map((b) => {
              const isUserEarned = user?.badges?.includes(b.name) || b.unlocked;

              return (
                <div
                  key={b.name}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUserEarned
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{b.icon}</span>
                    {isUserEarned ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        Locked
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                    {b.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Leaderboard */}
        <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Student Leaderboard
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Real-time standings</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard.map((stu, index) => {
              const isCurrent = user?.id === stu.id;

              return (
                <div
                  key={stu.id}
                  className={`py-3 px-2 flex items-center justify-between gap-3 rounded-xl transition-colors ${
                    isCurrent ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center text-xs font-extrabold ${
                      index === 0 ? 'text-amber-500 text-sm' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      #{index + 1}
                    </span>

                    <img
                      src={stu.avatarUrl}
                      alt={stu.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {stu.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {stu.department} • {stu.reportsCount} reports
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {stu.points} pts
                    </span>
                    <p className="text-[10px] text-slate-400">{stu.resolvedCount} fixed</p>
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
