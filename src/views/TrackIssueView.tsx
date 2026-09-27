import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Report, ReportStatus } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { 
  Search, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  UserCheck, 
  Eye, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Layers,
  Building,
  Check,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';

const stages = [
  { key: 'Report Submitted', label: 'Report Submitted', desc: 'Ticket registered in system' },
  { key: 'Under Review', label: 'Under Review', desc: 'Triage & safety assessment' },
  { key: 'Assigned', label: 'Assigned', desc: 'Dispatched to department' },
  { key: 'In Progress', label: 'In Progress', desc: 'Technicians on site' },
  { key: 'Resolved', label: 'Resolved', desc: 'Repairs completed & tested' },
  { key: 'Feedback', label: 'Feedback', desc: 'Student satisfaction rating' },
];

const REOPEN_REASONS = [
  'Problem still persists / Was not resolved',
  'Temporary fix failed / Broke again shortly after',
  'Incomplete repair / Missing hardware or parts',
  'New secondary hazard caused by repair',
  'Different issue observed in the same location',
];

export const TrackIssueView: React.FC = () => {
  const { 
    user,
    reports, 
    trackingTicketId, 
    setTrackingTicketId, 
    setSelectedReportId, 
    setCurrentView,
    refreshReports,
    showToast 
  } = useApp();

  const [searchInput, setSearchInput] = useState(trackingTicketId || '');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  // Status Filter for Report Entries Browser
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Pending' | 'Resolved' | 'Reopened'>('All');
  const [entriesSearch, setEntriesSearch] = useState('');
  const [showEntriesBrowser, setShowEntriesBrowser] = useState(true);

  // Student Reopen Modal State
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REOPEN_REASONS[0]);
  const [customReasonDetails, setCustomReasonDetails] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Admin Erase State
  const [confirmingErase, setConfirmingErase] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  // User-scoped reports: For students, only show their own reports; for admin, show all
  const scopedReports = useMemo(() => {
    if (user?.role === 'student') {
      return reports.filter(r => r.reporterId === user.id);
    }
    return reports;
  }, [reports, user]);

  const performSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    const cleanId = idToSearch.trim().toUpperCase();

    // Check local loaded reports first
    const match = reports.find(r => r.id.toUpperCase() === cleanId);
    if (match) {
      setActiveReport(match);
      setTrackingTicketId(match.id);
      return;
    }

    // Otherwise fetch via API
    try {
      setLoading(true);
      const res = await api.getReportById(cleanId);
      setActiveReport(res.report);
      setTrackingTicketId(res.report.id);
    } catch (err) {
      showToast(`No report found with ID "${cleanId}". Check the format (e.g. CF-2024-1001).`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingTicketId) {
      setSearchInput(trackingTicketId);
      performSearch(trackingTicketId);
    } else if (!activeReport) {
      if (user?.role === 'admin' && reports.length > 0) {
        setActiveReport(reports[0]);
        setSearchInput(reports[0].id);
      } else if (user?.role === 'student') {
        const myReports = reports.filter(r => r.reporterId === user.id);
        if (myReports.length > 0) {
          setActiveReport(myReports[0]);
          setSearchInput(myReports[0].id);
        } else {
          // For new users keep reports and track issues null at the beginning until they add
          setActiveReport(null);
          setSearchInput('');
        }
      }
    }
  }, [trackingTicketId, reports, user]);

  // Keep activeReport in sync when reports are refreshed (e.g. after reopening)
  useEffect(() => {
    if (activeReport) {
      const updated = reports.find(r => r.id === activeReport.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(activeReport)) {
        setActiveReport(updated);
      }
    }
  }, [reports]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  const handleSelectReport = (rep: Report) => {
    setActiveReport(rep);
    setSearchInput(rep.id);
    setTrackingTicketId(rep.id);
    // Smooth scroll down to the active report tracking section
    const el = document.getElementById('active-tracking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to determine stage state
  const getStageIndex = (status: ReportStatus) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Reopened': return 3; // Reopened is actively back under maintenance
      case 'Resolved': return activeReport?.feedback ? 5 : 4;
      default: return 0;
    }
  };

  const currentStageIndex = activeReport ? getStageIndex(activeReport.status) : 0;

  // Filtered reports for entries list (scoped to user reports for students)
  const filteredReportEntries = useMemo(() => {
    return scopedReports.filter(r => {
      // Status filter
      if (statusFilter !== 'All') {
        if (r.status !== statusFilter) return false;
      }
      // Search keyword filter
      if (entriesSearch.trim()) {
        const query = entriesSearch.toLowerCase();
        const matchId = r.id.toLowerCase().includes(query);
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchCat = r.category.toLowerCase().includes(query);
        const matchLoc = r.location.toLowerCase().includes(query);
        return matchId || matchTitle || matchCat || matchLoc;
      }
      return true;
    });
  }, [scopedReports, statusFilter, entriesSearch]);

  // Handle Admin Erase Report
  const handleAdminErase = async () => {
    if (!activeReport) return;
    try {
      setIsErasing(true);
      await api.deleteReport(activeReport.id, user || undefined);
      showToast(`Report ${activeReport.id} was permanently erased from campus database.`, 'success');
      setActiveReport(null);
      setSearchInput('');
      setConfirmingErase(false);
      await refreshReports();
    } catch (e: any) {
      showToast(e.message || 'Failed to erase report', 'error');
    } finally {
      setIsErasing(false);
    }
  };

  // Handle Reopening the Issue
  const handleConfirmReopen = async () => {
    if (!activeReport) return;

    try {
      setSubmittingReopen(true);
      const studentActor = user?.name ? `${user.name} (${user.role === 'student' ? 'Student' : 'User'})` : 'Student (Reporter)';
      const fullNote = `Issue Reopened by student: ${selectedReason}. ${customReasonDetails ? `Student note: "${customReasonDetails.trim()}"` : ''}`.trim();

      const response = await api.updateReport(
        activeReport.id,
        {
          status: 'Reopened',
          note: fullNote,
          actorName: studentActor,
          priority: activeReport.priority === 'Low' ? 'Medium' : activeReport.priority // boost priority slightly if reoccurring
        },
        user || undefined as any
      );

      setActiveReport(response.report);
      setIsReopenModalOpen(false);
      setCustomReasonDetails('');
      showToast(`Ticket ${activeReport.id} reopened successfully. Campus facilities technicians have been alerted for re-inspection.`, 'success');
      await refreshReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to reopen ticket. Please try again.', 'error');
    } finally {
      setSubmittingReopen(false);
    }
  };

  // Status counts for filter chips (scoped)
  const countInProgress = scopedReports.filter(r => r.status === 'In Progress').length;
  const countPending = scopedReports.filter(r => r.status === 'Pending').length;
  const countResolved = scopedReports.filter(r => r.status === 'Resolved').length;
  const countReopened = scopedReports.filter(r => r.status === 'Reopened').length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      {/* Header & Quick Search Bar */}
      <div className="glass-panel rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
            Live Ticket Dispatch Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-['Space_Grotesk']">
            Track Your Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Follow live repair transitions, visual status indicators, and technician dispatch timelines.
          </p>
        </div>

        {/* Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Ticket ID (e.g. CF-2024-1001)"
            className="w-full pl-4 pr-24 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <Search className="w-3 h-3" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {/* RECENT TICKETS QUICK BAR WITH VISUAL STATUS BADGES */}
      {scopedReports.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Quick Select Recent Tickets:
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click any ticket to inspect
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
            {scopedReports.slice(0, 6).map((r) => {
              const isSelected = activeReport?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectReport(r)}
                  className={`px-3 py-2 rounded-xl shrink-0 transition-all flex items-center gap-2 border text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30 font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {r.id}
                    </span>
                    <span className={`text-[10px] truncate max-w-[110px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {r.title}
                    </span>
                  </div>
                  {/* Visual Status Badge on Each Entry */}
                  <div className="shrink-0 pointer-events-none scale-90 origin-right">
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 1: REPORT ENTRIES BROWSER WITH VISUAL STATUS BADGES
          (Prompt requirement: visual status badges for each report entry)
      ========================================================= */}
      <section className="glass-card rounded-[28px] p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Campus Report Entries & Status Overview
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visual status badges for each reported issue. Select any entry to load its live dispatch journey.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEntriesBrowser(!showEntriesBrowser)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>{showEntriesBrowser ? 'Hide Directory' : 'Show All Entries'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showEntriesBrowser ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {showEntriesBrowser && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Filter Tabs & Keyword Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    statusFilter === 'All'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({reports.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('In Progress')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    statusFilter === 'In Progress'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>In Progress ({countInProgress})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    statusFilter === 'Pending'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Pending ({countPending})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Resolved')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    statusFilter === 'Resolved'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Resolved ({countResolved})</span>
                </button>

                {countReopened > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter('Reopened')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      statusFilter === 'Reopened'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reopened ({countReopened})</span>
                  </button>
                )}
              </div>

              {/* Entries Search Input */}
              <div className="relative min-w-[200px] sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={entriesSearch}
                  onChange={(e) => setEntriesSearch(e.target.value)}
                  placeholder="Filter entries..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

            </div>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {filteredReportEntries.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  No tickets found matching the selected filter or search keyword.
                </div>
              ) : (
                filteredReportEntries.map((item) => {
                  const isCurrentlyActive = activeReport?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectReport(item)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative flex flex-col justify-between gap-2.5 ${
                        isCurrentlyActive
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Row: Ticket ID + Visual Status Badge + Priority Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 dark:text-cyan-300 bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">
                            {item.id}
                          </span>
                          <PriorityBadge priority={item.priority} size="sm" />
                        </div>
                        {/* Clear Visual Status Badge */}
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      {/* Middle: Title & Location */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.location}
                          </span>
                          <span>•</span>
                          <span className="truncate">{item.category}</span>
                        </div>
                      </div>

                      {/* Bottom Row: Timestamp + Track Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        
                        {isCurrentlyActive ? (
                          <span className="font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            Tracking Now
                          </span>
                        ) : (
                          <span className="font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-0.5">
                            <span>Track live</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </section>

      {/* =========================================================
          SECTION 2: ACTIVE REPORT DETAILS & LIVE RESOLUTION TIMELINE
      ========================================================= */}
      <div id="active-tracking-section">
        {loading ? (
          <div className="p-16 text-center text-slate-400 glass-card rounded-[28px]">
            <span className="animate-spin inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium">Looking up report...</p>
          </div>
        ) : activeReport ? (
          <div className="space-y-6">
            
            {/* Main Card with Details */}
            <div className="glass-card rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {activeReport.id}
                    </span>
                    {/* Visual Status Badge */}
                    <StatusBadge status={activeReport.status} />
                    <PriorityBadge priority={activeReport.priority} />
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {activeReport.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {activeReport.location}
                    </span>
                    <span>•</span>
                    <span>Reported on {new Date(activeReport.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>Category: {activeReport.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start shrink-0">
                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setConfirmingErase(true)}
                      className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase Issue</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedReportId(activeReport.id)}
                    className="px-3.5 py-2 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>Full Details & Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* =========================================================
                  FEATURE: STUDENT REOPEN CALLOUT
                  (Prompt: add a feature to student that if issue did not solve student can reopen the issue)
              ========================================================= */}
              {activeReport.status === 'Resolved' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/25">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <span>Issue marked Resolved, but problem still exists?</span>
                      </h4>
                      <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                        If the repair was incomplete, temporary, or the issue reoccurred, students can reopen this ticket to request immediate re-inspection by campus facilities.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReopenModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 self-stretch sm:self-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reopen This Issue</span>
                  </button>
                </div>
              )}

              {/* REOPENED NOTIFICATION BANNER (When issue is currently reopened) */}
              {activeReport.status === 'Reopened' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-300 dark:border-amber-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Ticket Reopened by Student for Follow-Up Inspection
                    </span>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      This ticket was reopened because the repair was incomplete or problem persisted. Maintenance technicians have been dispatched for immediate re-evaluation.
                    </p>
                  </div>
                </div>
              )}

              {/* VISUAL COMPLAINT STAGES TIMELINE */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Resolution Journey
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>Current Status:</span>
                    <StatusBadge status={activeReport.status} size="sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {stages.map((stg, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const isUpcoming = idx > currentStageIndex;

                    return (
                      <div
                        key={stg.key}
                        className={`relative p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between ${
                          isCurrent
                            ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-md ring-2 ring-blue-500/20'
                            : isCompleted
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                        }`}
                      >
                        <div className="mb-2">
                          {isCompleted && (
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mx-auto shadow-sm">
                              ✓
                            </div>
                          )}
                          {isCurrent && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mx-auto shadow-sm animate-pulse">
                              {idx + 1}
                            </div>
                          )}
                          {isUpcoming && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs flex items-center justify-center mx-auto">
                              {idx + 1}
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <p className={`text-xs font-bold ${
                            isCurrent ? 'text-blue-700 dark:text-cyan-300' : isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {stg.label}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {stg.desc}
                          </p>
                        </div>

                        {/* Status indicator pill */}
                        <span className={`mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isCurrent 
                            ? (activeReport.status === 'Reopened' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white') 
                            : isCompleted 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {isCurrent ? (activeReport.status === 'Reopened' ? 'Reopened' : 'Active Now') : isCompleted ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Status Cards: Assigned Dept, Staff, Expected Resolution */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">Assigned Department</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">
                    {activeReport.assignedDepartment || 'Queueing for Department'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">Assigned Technician</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">
                    {activeReport.assignedStaff || 'Dispatching staff...'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">Expected Resolution</span>
                  <p className="font-bold text-blue-600 dark:text-cyan-400 mt-1">
                    {activeReport.status === 'Resolved' 
                      ? 'Completed & Confirmed' 
                      : activeReport.status === 'Reopened' 
                      ? 'Priority Re-Inspection'
                      : activeReport.expectedResolutionDays 
                      ? `Within ~${activeReport.expectedResolutionDays} day(s)` 
                      : 'Estimated 24-48 hours'}
                  </p>
                </div>
              </div>

              {/* Latest Update Box */}
              {activeReport.timeline.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs">
                  <span className="font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-[10px]">
                    Latest Dispatcher Timeline Update:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    "{activeReport.timeline[activeReport.timeline.length - 1].note}"
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5">
                    <span>By {activeReport.timeline[activeReport.timeline.length - 1].actor}</span>
                    <span>•</span>
                    <span>{new Date(activeReport.timeline[activeReport.timeline.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="glass-card rounded-[28px] p-10 sm:p-14 text-center border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🔍
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                No Issue Selected For Tracking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {user?.role === 'student'
                  ? "You haven't reported any campus issues yet. Once you submit a report, you will be able to track live technician dispatches, photos, and updates here."
                  : "Enter a Ticket ID (e.g. CF-2024-1001) in the search box above or click on an issue from the browser above to inspect live details."
                }
              </p>
            </div>
            {user?.role === 'student' && (
              <button
                type="button"
                onClick={() => setCurrentView('report')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Erase Issue Confirmation Modal */}
      {confirmingErase && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-rose-200 dark:border-rose-900 p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Erase Report Permanently?</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to completely erase ticket <strong>{activeReport.id}</strong> ("{activeReport.title}")? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingErase(false)}
                disabled={isErasing}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminErase}
                disabled={isErasing}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isErasing ? 'Erasing...' : 'Confirm Erase'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          REOPEN ISSUE MODAL FOR STUDENTS
      ========================================================= */}
      {isReopenModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Reopen Ticket: {activeReport.id}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Notify campus facilities that the issue requires re-inspection
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Subject Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <span className="text-slate-400 font-medium">Issue Subject:</span>
              <p className="font-bold text-slate-900 dark:text-white">{activeReport.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeReport.location} • {activeReport.category}</p>
            </div>

            {/* Reason Radio Group */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Why are you reopening this issue?
              </label>

              <div className="space-y-1.5">
                {REOPEN_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-semibold'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reopenReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Additional Observations / Location Notes:
              </label>
              <textarea
                rows={3}
                value={customReasonDetails}
                onChange={(e) => setCustomReasonDetails(e.target.value)}
                placeholder="e.g. Water is still leaking from the main valve in room 204. Please send technician back to inspect."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Keep Resolved
              </button>

              <button
                type="button"
                disabled={submittingReopen}
                onClick={handleConfirmReopen}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/25 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {submittingReopen ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm & Reopen Issue</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
