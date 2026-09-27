import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Report, ReportStatus, ReportPriority } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  ArrowUpDown, 
  ChevronRight,
  ShieldCheck,
  Send,
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { reports, setSelectedReportId, refreshReports, showToast, user } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Erase Report State
  const [reportToErase, setReportToErase] = useState<Report | null>(null);
  const [isErasing, setIsErasing] = useState<boolean>(false);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (statusFilter !== 'All') {
      result = result.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (priorityFilter !== 'All') {
      result = result.filter(r => r.priority.toLowerCase() === priorityFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.assignedDepartment && r.assignedDepartment.toLowerCase().includes(q))
      );
    }

    return result;
  }, [reports, statusFilter, priorityFilter, searchQuery]);

  // Quick Action: Update status directly from table row
  const handleQuickStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    if (!user) return;
    try {
      setUpdatingId(reportId);
      await api.updateReport(reportId, {
        status: newStatus,
        note: `Status changed to ${newStatus} via Operations Quick Dispatch.`
      }, user);
      showToast(`Report ${reportId} marked as ${newStatus}`, 'success');
      await refreshReports();
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Erase Report action
  const handleConfirmEraseReport = async () => {
    if (!reportToErase) return;
    try {
      setIsErasing(true);
      await api.deleteReport(reportToErase.id, user || undefined);
      showToast(`Report ${reportToErase.id} ("${reportToErase.title}") was permanently erased.`, 'success');
      await refreshReports();
      setReportToErase(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to erase report', 'error');
    } finally {
      setIsErasing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Operations Report Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch technicians, assign departments, and update ticket resolution statuses or erase invalid issues.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by ID, location, title, or technician..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent Only</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div className="space-y-3">
        {filteredReports.map((rep) => {
          return (
            <div
              key={rep.id}
              className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div 
                onClick={() => setSelectedReportId(rep.id)}
                className="flex items-start gap-4 cursor-pointer flex-1"
              >
                {rep.imageUrl ? (
                  <img src={rep.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    🛠️
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {rep.id}
                    </span>
                    <StatusBadge status={rep.status} size="sm" />
                    <PriorityBadge priority={rep.priority} size="sm" />
                    <span className="text-xs font-semibold text-slate-500">{rep.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                    {rep.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {rep.location}
                    </span>
                    <span>•</span>
                    <span>Reported by {rep.reporterName}</span>
                    <span>•</span>
                    <span>Dept: <strong className="text-slate-700 dark:text-slate-300">{rep.assignedDepartment || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Quick Dispatch Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                {rep.status !== 'In Progress' && rep.status !== 'Resolved' && (
                  <button
                    onClick={() => handleQuickStatusChange(rep.id, 'In Progress')}
                    disabled={updatingId === rep.id}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    Start Work
                  </button>
                )}

                {rep.status !== 'Resolved' && (
                  <button
                    onClick={() => handleQuickStatusChange(rep.id, 'Resolved')}
                    disabled={updatingId === rep.id}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedReportId(rep.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span>Dispatch & Edit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Erase Report Action */}
                <button
                  onClick={() => setReportToErase(rep)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-all"
                  title="Erase / Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Erase Report Confirmation Modal */}
      {reportToErase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-rose-200 dark:border-rose-900/80 p-6 space-y-4">
            
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Erase Campus Issue
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{reportToErase.id}</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">{reportToErase.category}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{reportToErase.title}</p>
              <p className="text-slate-500">{reportToErase.location} • Reported by {reportToErase.reporterName}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently erase this report? This will delete the ticket, its timeline, student feedback, and associated alerts from Cloud Firestore.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReportToErase(null)}
                disabled={isErasing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmEraseReport}
                disabled={isErasing}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isErasing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Erasing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Erase Issue</span>
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

