import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Table, 
  Check, 
  X, 
  Calendar, 
  ShieldCheck, 
  Filter, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Report, User } from '../types';
import { exportReportsToPDF, exportReportsToCSV } from '../utils/exportReports';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allReports: Report[];
  filteredReports: Report[];
  user: User | null;
  onExportSuccess?: (format: 'pdf' | 'csv', count: number) => void;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  allReports,
  filteredReports,
  user,
  onExportSuccess
}) => {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const targetReports = scope === 'filtered' ? filteredReports : allReports;
  const count = targetReports.length;

  const resolvedCount = targetReports.filter(r => r.status === 'Resolved').length;
  const inProgressCount = targetReports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
  const pendingCount = targetReports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;

  const handleExport = () => {
    if (count === 0) return;
    setIsExporting(true);

    try {
      if (format === 'pdf') {
        exportReportsToPDF(targetReports, user);
      } else {
        exportReportsToCSV(targetReports, user);
      }

      if (onExportSuccess) {
        onExportSuccess(format, count);
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Download Issue History
              </h3>
              <p className="text-xs text-slate-500">
                Export your personal campus complaints & resolution records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Format Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Choose Export Format:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* PDF Option */}
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                format === 'pdf'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                {format === 'pdf' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  PDF Document
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Official formatted transcript for personal files & verification
                </span>
              </div>
            </button>

            {/* CSV Option */}
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                format === 'csv'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                {format === 'csv' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  CSV Spreadsheet
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Raw data table for Microsoft Excel or Google Sheets
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Scope Selection (All vs Filtered) */}
        {allReports.length !== filteredReports.length && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Record Scope:
            </label>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
                  scope === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Reports ({allReports.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
                  scope === 'filtered'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Filtered Only ({filteredReports.length})
              </button>
            </div>
          </div>
        )}

        {/* 3. Summary Overview Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Summary of Data to Export:</span>
            <span className="font-mono text-blue-600 dark:text-cyan-400">{count} Total Reports</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block">{resolvedCount}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-500">Resolved</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60">
              <span className="text-xs font-extrabold text-blue-700 dark:text-cyan-400 block">{inProgressCount}</span>
              <span className="text-[10px] text-blue-600 dark:text-cyan-500">In Progress</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 block">{pendingCount}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-500">Pending</span>
            </div>
          </div>

          {user && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              Includes: Student Roll No. <strong className="text-slate-700 dark:text-slate-300">{user.rollNumber || 'N/A'}</strong>, department verification, timestamps & resolution logs.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={count === 0 || isExporting}
            className="flex-2 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : `Export ${count} Reports as ${format.toUpperCase()}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
