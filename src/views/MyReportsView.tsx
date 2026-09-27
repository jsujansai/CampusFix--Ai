import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { DownloadReportModal } from '../components/DownloadReportModal';
import { exportReportsToPDF, exportReportsToCSV } from '../utils/exportReports';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ArrowUpDown, 
  PlusCircle, 
  ChevronRight,
  Sparkles,
  Inbox,
  Download,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

export const MyReportsView: React.FC = () => {
  const { 
    reports, 
    user, 
    setSelectedReportId, 
    setCurrentView,
    showToast
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Filter for current user's reports only
  const userReports = useMemo(() => {
    return user ? reports.filter(r => r.reporterId === user.id) : [];
  }, [reports, user]);

  const filteredReports = useMemo(() => {
    let result = [...userReports];

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        result = result.filter(r => r.status === 'Pending' || r.status === 'Under Review');
      } else if (statusFilter === 'In Progress') {
        result = result.filter(r => r.status === 'In Progress' || r.status === 'Assigned');
      } else {
        result = result.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
      }
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(r => r.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'priority') {
      const weights: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [userReports, statusFilter, categoryFilter, searchQuery, sortBy]);

  const filterTabs = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
            My Campus Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your submitted complaints, track technician progress, and view resolution confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Download Report Button */}
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            disabled={userReports.length === 0}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Download personal issue history as PDF or CSV"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Download Report</span>
          </button>

          <button
            onClick={() => setCurrentView('report')}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Segmented Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search, Category, Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, location or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Wi-Fi / IT">Wi-Fi / IT</option>
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Road / Pathway">Road / Pathway</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Count & Quick Export Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredReports.length}</strong> of{' '}
          <strong className="text-slate-800 dark:text-slate-200">{userReports.length}</strong> submitted issues
        </span>

        {userReports.length > 0 && (
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-slate-400">Quick Export:</span>
            <button
              onClick={() => {
                exportReportsToPDF(filteredReports, user);
                showToast(`Exported ${filteredReports.length} reports as PDF document`, 'success');
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-800/60 transition-colors"
              title="Download current reports as PDF"
            >
              <FileText className="w-3 h-3" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => {
                exportReportsToCSV(filteredReports, user);
                showToast(`Exported ${filteredReports.length} reports as CSV spreadsheet`, 'success');
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
              title="Download current reports as CSV"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((rep) => {
          let progress = 20;
          if (rep.status === 'Under Review') progress = 35;
          if (rep.status === 'Assigned') progress = 55;
          if (rep.status === 'In Progress') progress = 75;
          if (rep.status === 'Resolved') progress = 100;

          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReportId(rep.id)}
              className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-start gap-4">
                  {rep.imageUrl ? (
                    <img
                      src={rep.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                      📋
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rep.id}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
                        {rep.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {rep.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {rep.location}
                      </span>
                      <span>•</span>
                      <span>{new Date(rep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {rep.assignedDepartment && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{rep.assignedDepartment}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={rep.status} />
                    <PriorityBadge priority={rep.priority} />
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>

              {/* Progress track */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 text-[11px]">
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rep.status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-300 shrink-0">{progress}%</span>
                </div>

                {rep.comments.length > 0 && (
                  <span className="text-slate-400 shrink-0">
                    💬 {rep.comments.length} updates
                  </span>
                )}
              </div>

            </div>
          );
        })}

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="glass-card rounded-[28px] p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-3">
              🌱
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Your campus story starts here.</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No reports match your current filters. If you notice any campus issues, submit a quick ticket!
            </p>
            <button
              onClick={() => setCurrentView('report')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Report an Issue →
            </button>
          </div>
        )}
      </div>

      {/* Download Report Modal */}
      <DownloadReportModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        allReports={userReports}
        filteredReports={filteredReports}
        user={user}
        onExportSuccess={(fmt, count) => {
          showToast(`Successfully downloaded ${count} reports as ${fmt.toUpperCase()}!`, 'success');
        }}
      />

    </div>
  );
};
