import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Bell, 
  CheckCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wrench, 
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    unreadNotifs, 
    user, 
    refreshNotifications, 
    setSelectedReportId, 
    setCurrentView,
    setTrackingTicketId,
    showToast 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await api.markAllNotificationsRead(user);
      await refreshNotifications();
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast('Failed to mark all as read.', 'error');
    }
  };

  const handleItemClick = async (notif: any) => {
    if (!user) return;
    if (!notif.isRead) {
      await api.markNotificationRead(notif.id, user);
      await refreshNotifications();
    }
    if (notif.reportId) {
      setTrackingTicketId(notif.reportId);
      setCurrentView('track');
    }
  };

  const filteredNotifs = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              Notification Center
            </h1>
            {unreadNotifs > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {unreadNotifs} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates on ticket dispatches, technician notes, and campus announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadNotifs > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Mark all read</span>
            </button>
          )}

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-2xs' : 'text-slate-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition-all ${filter === 'unread' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-2xs' : 'text-slate-500'}`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.map((notif) => {
          return (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                notif.isRead
                  ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80 hover:opacity-100'
                  : 'border-blue-200 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'success' && (
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {notif.type === 'urgent' && (
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
                {notif.type === 'info' && (
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                )}
                {notif.type === 'warning' && (
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                {notif.reportId && (
                  <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                    <span>Track Ticket {notif.reportId}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>

              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          );
        })}

        {filteredNotifs.length === 0 && (
          <div className="glass-card rounded-[28px] p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-xs text-slate-400 mt-1">No notifications to display.</p>
          </div>
        )}
      </div>

    </div>
  );
};
