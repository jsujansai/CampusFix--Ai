import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Report, ReportStatus, ReportPriority } from '../types';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Wrench, 
  MessageSquare, 
  Send, 
  Star, 
  CheckCircle2, 
  Share2, 
  Map, 
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const ReportDetailModal: React.FC = () => {
  const { 
    selectedReportId, 
    setSelectedReportId, 
    user, 
    showToast, 
    refreshReports,
    setCurrentView,
    setTrackingTicketId
  } = useApp();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // Feedback state
  const [starRating, setStarRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  // Admin edit state
  const [adminStatus, setAdminStatus] = useState<ReportStatus>('In Progress');
  const [adminDept, setAdminDept] = useState<string>('');
  const [adminStaff, setAdminStaff] = useState<string>('');
  const [adminPriority, setAdminPriority] = useState<ReportPriority>('Medium');
  const [adminNote, setAdminNote] = useState<string>('');
  const [updatingAdmin, setUpdatingAdmin] = useState<boolean>(false);
  const [reopening, setReopening] = useState<boolean>(false);
  const [confirmingErase, setConfirmingErase] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);

  const handleEraseIssue = async () => {
    if (!report) return;
    try {
      setIsErasing(true);
      await api.deleteReport(report.id, user || undefined);
      showToast(`Report ${report.id} was permanently erased from campus database.`, 'success');
      await refreshReports();
      setSelectedReportId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to erase report', 'error');
    } finally {
      setIsErasing(false);
      setConfirmingErase(false);
    }
  };

  const handleStudentReopen = async () => {
    if (!report) return;
    try {
      setReopening(true);
      const studentActor = user?.name ? `${user.name} (Student)` : 'Student Reporter';
      await api.updateReport(
        report.id,
        {
          status: 'Reopened',
          note: `Issue reopened by student: Problem not solved or reoccurred. Requested technician follow-up.`,
          actorName: studentActor
        },
        user || undefined as any
      );
      showToast(`Ticket ${report.id} reopened. Facilities technicians alerted for re-inspection.`, 'success');
      const updated = await api.getReportById(report.id);
      setReport(updated.report);
      setAdminStatus(updated.report.status);
      refreshReports();
    } catch (err) {
      showToast('Failed to reopen report', 'error');
    } finally {
      setReopening(false);
    }
  };

  useEffect(() => {
    if (!selectedReportId) {
      setReport(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await api.getReportById(selectedReportId);
        setReport(data.report);
        setAdminStatus(data.report.status);
        setAdminDept(data.report.assignedDepartment || '');
        setAdminStaff(data.report.assignedStaff || '');
        setAdminPriority(data.report.priority);
      } catch (err) {
        showToast(`Failed to load report ${selectedReportId}`, 'error');
        setSelectedReportId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedReportId]);

  if (!selectedReportId) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !report) return;

    try {
      setSubmittingComment(true);
      await api.addComment(report.id, commentText, user);
      showToast('Comment posted.', 'success');
      setCommentText('');
      // Refresh report
      const updated = await api.getReportById(report.id);
      setReport(updated.report);
      refreshReports();
    } catch (err) {
      showToast('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !report) return;

    try {
      setSubmittingFeedback(true);
      await api.submitFeedback(report.id, starRating, feedbackComment, user);
      showToast('Thank you! Feedback recorded (+25 points awarded)', 'success');
      const updated = await api.getReportById(report.id);
      setReport(updated.report);
      refreshReports();
    } catch (err) {
      showToast('Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !report) return;

    try {
      setUpdatingAdmin(true);
      await api.updateReport(report.id, {
        status: adminStatus,
        assignedDepartment: adminDept,
        assignedStaff: adminStaff,
        priority: adminPriority,
        note: adminNote,
        actorName: `${user.name} (${user.department})`
      }, user);

      showToast(`Report updated to ${adminStatus}`, 'success');
      setAdminNote('');
      const updated = await api.getReportById(report.id);
      setReport(updated.report);
      refreshReports();
    } catch (err) {
      showToast('Failed to update report', 'error');
    } finally {
      setUpdatingAdmin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col my-auto max-h-[92vh]">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 glass-panel">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {report?.id || selectedReportId}
            </span>
            {report && (
              <>
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={() => {
                  setTrackingTicketId(report.id);
                  setSelectedReportId(null);
                  setCurrentView('track');
                }}
                className="text-xs text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold mr-2"
              >
                <MapPin className="w-3.5 h-3.5" />
                Track Full View
              </button>
            )}
            <button
              onClick={() => setSelectedReportId(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <span className="animate-spin inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm font-medium">Loading report details...</p>
          </div>
        ) : report ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Title & Description */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                <span>{report.category}</span>
                <span>•</span>
                <span>{report.building}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {report.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>

            {/* Photo Attachment if available */}
            {report.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 max-h-72">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover max-h-72"
                />
              </div>
            )}

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Specific Location</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{report.roomOrArea || report.location}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Assigned Department</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{report.assignedDepartment || 'Pending Assignment'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Assigned Staff</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{report.assignedStaff || 'Queueing technician'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Reported Date</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Resolution Progress Timeline */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Resolution Audit & Status Timeline</span>
              </h3>
              
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {report.timeline.map((step, idx) => (
                  <div key={step.id || idx} className="relative group">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{step.stage}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{step.note}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 italic">By: {step.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN ACTIONS PANEL (Visible to Admin or when test-switching) */}
            {user?.role === 'admin' && (
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    Admin Operations: Dispatch & Status Control
                  </h4>
                </div>

                <form onSubmit={handleAdminUpdate} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                      <select
                        value={adminStatus}
                        onChange={(e) => setAdminStatus(e.target.value as ReportStatus)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <select
                        value={adminDept}
                        onChange={(e) => setAdminDept(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      >
                        <option value="Electrical Maintenance">Electrical Maintenance</option>
                        <option value="Plumbing & Water Services">Plumbing & Water Services</option>
                        <option value="IT & Campus Network">IT & Campus Network</option>
                        <option value="Housekeeping & Sanitation">Housekeeping & Sanitation</option>
                        <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                        <option value="Campus Security & Safety">Campus Security & Safety</option>
                        <option value="Laboratory Equipment Support">Laboratory Equipment Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Technician / Staff</label>
                      <input
                        type="text"
                        value={adminStaff}
                        onChange={(e) => setAdminStaff(e.target.value)}
                        placeholder="e.g. Lead Ray Cooper"
                        className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Update Note / Dispatch Reason</label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="e.g. Parts arrived from central depot, technician Ray assigned."
                      className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setConfirmingErase(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-all shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase Issue</span>
                    </button>

                    <button
                      type="submit"
                      disabled={updatingAdmin}
                      className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-all shadow-sm"
                    >
                      {updatingAdmin ? 'Saving...' : 'Apply Admin Update'}
                    </button>
                  </div>
                </form>

                {/* Erase Issue Confirmation Modal inside Report Detail */}
                {confirmingErase && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-rose-200 dark:border-rose-900 p-5 space-y-3">
                      <div className="flex items-center gap-2.5 text-rose-600">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Erase Report Permanently?</h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Are you sure you want to completely erase ticket <strong>{report.id}</strong> ("{report.title}")? This action cannot be undone.
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
                          onClick={handleEraseIssue}
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
              </div>
            )}

            {/* STUDENT RESOLUTION FEEDBACK (If Resolved) */}
            {report.status === 'Resolved' && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolution Feedback & Student Rating
                </h4>

                {report.feedback ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < report.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                        {report.feedback.rating}/5 Stars
                      </span>
                    </div>
                    {report.feedback.comment && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                        "{report.feedback.comment}"
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Submitted on {new Date(report.feedback.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : user?.id === report.reporterId ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-2 mt-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      How was the repair quality and response time? Rate to earn +25 points!
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setStarRating(num)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${num <= starRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Add an optional review (e.g. Fixed quickly, thank you!)"
                      className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg"
                    />
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Review (+25 pts)'}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500 italic">No student rating submitted yet.</p>
                )}

                {/* Reopen Action for Students if issue wasn't actually resolved */}
                <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Issue not fixed or problem returned?
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Reopen this ticket to request immediate technician follow-up.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStudentReopen}
                    disabled={reopening}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{reopening ? 'Reopening...' : 'Reopen Ticket'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reopened Banner */}
            {report.status === 'Reopened' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ticket Reopened by Student — Awaiting Technician Re-Inspection</span>
                </div>
              </div>
            )}

            {/* Comments & Communication Section */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Ticket Discussion ({report.comments.length})</span>
              </h3>

              <div className="space-y-3 mb-4">
                {report.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-xl border text-xs ${
                      comm.userRole === 'admin'
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {comm.userAvatar && (
                          <img src={comm.userAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">{comm.userName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          comm.userRole === 'admin' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {comm.userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comm.message}</p>
                  </div>
                ))}
                {report.comments.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No comments yet. Have an update or detail to add?</p>
                )}
              </div>

              {/* Add Comment Input */}
              {user && (
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type an update or comment..."
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
