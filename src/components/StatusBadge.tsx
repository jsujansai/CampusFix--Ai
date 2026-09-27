import React from 'react';
import { ReportStatus, ReportPriority } from '../types';
import { Clock, Eye, UserCheck, Wrench, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'Pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <Clock className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Pending
        </span>
      );
    case 'Under Review':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <Eye className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Under Review
        </span>
      );
    case 'Assigned':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <UserCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <Wrench className={isSm ? 'w-3 h-3 animate-pulse' : 'w-3.5 h-3.5 animate-pulse'} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Resolved
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <XCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Rejected
        </span>
      );
    case 'Reopened':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <RotateCcw className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Reopened
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-slate-100 text-slate-700 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          {status}
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: ReportPriority; size?: 'sm' | 'md' }> = ({ priority, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (priority) {
    case 'Urgent':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
          <AlertCircle className="w-3 h-3 text-rose-600 animate-bounce" />
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
          High Priority
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
          Low
        </span>
      );
    default:
      return null;
  }
};
