import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ReportCategory, ReportPriority, AIAnalysisResult, DuplicateWarning } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { QRCodeScannerModal, ScannedLocationData } from '../components/QRCodeScannerModal';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { AudioVoiceRecordModal } from '../components/AudioVoiceRecordModal';
import { DevicePermissionsModal } from '../components/DevicePermissionsModal';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Mic, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  X,
  FileCheck,
  Building,
  Layers,
  Zap,
  QrCode,
  ShieldCheck,
  Sliders
} from 'lucide-react';

const categories: ReportCategory[] = [
  'Maintenance',
  'IT Support',
  'Safety',
  'Electrical',
  'Plumbing',
  'Wi-Fi / IT',
  'Classroom',
  'Laboratory',
  'Cleanliness',
  'Road / Pathway',
  'Hostel',
  'Security',
  'Library',
  'Other'
];

const campusBuildings = [
  'Central Library',
  'Tech & Science Complex',
  'Main Academic Block',
  'Hostel Block A',
  'Hostel Block B',
  'Student Union & Canteen',
  'Sports Complex & Arena',
  'Main North Entrance',
  'Engineering Workshops'
];

const sampleImagePresets = [
  { label: 'Broken Lighting', url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Water Leakage', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Damaged Bench', url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Wi-Fi / Network', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' }
];

export const ReportIssueView: React.FC = () => {
  const { 
    user, 
    showToast, 
    refreshReports, 
    setCurrentView, 
    setTrackingTicketId,
    setSelectedReportId,
    prefilledCategory,
    setPrefilledCategory,
    prefilledPriority,
    setPrefilledPriority
  } = useApp();

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Maintenance');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('Central Library');
  const [roomOrArea, setRoomOrArea] = useState('');
  const [priority, setPriority] = useState<ReportPriority>('Medium');
  const [imageUrl, setImageUrl] = useState('');
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);

  // QR Code Scanner State
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedTagInfo, setScannedTagInfo] = useState<string | null>(null);

  // Live Camera Photo Capture State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Microphone Audio Voice Record State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Device Permissions State
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // QR Scan Callback Handler
  const handleQRScanSuccess = (data: ScannedLocationData) => {
    if (data.building) {
      // Find matching campus building if available, else pick closest or default
      const matched = campusBuildings.find(
        b => b.toLowerCase() === data.building?.toLowerCase() || data.building?.toLowerCase().includes(b.toLowerCase())
      );
      if (matched) {
        setBuilding(matched);
      } else {
        setBuilding(data.building);
      }
    }

    if (data.roomOrArea) {
      setRoomOrArea(data.roomOrArea);
    }

    if (data.category) {
      const catMatch = categories.find(
        c => c.toLowerCase() === data.category?.toLowerCase()
      );
      if (catMatch) {
        setCategory(catMatch);
      }
    }

    const tagSummary = data.code || `${data.building || ''} - ${data.roomOrArea || ''}`;
    setScannedTagInfo(tagSummary);
    showToast(`Scanned QR location: ${data.building || 'Campus'} - ${data.roomOrArea || 'Detected'}`, 'success');
  };

  // Consume prefilled values if navigated from Quick Actions
  useEffect(() => {
    if (prefilledCategory) {
      setCategory(prefilledCategory);
      setQuickActionNotice(prefilledCategory);
      if (prefilledPriority) {
        setPriority(prefilledPriority);
      }
      setPrefilledCategory(null);
      if (setPrefilledPriority) {
        setPrefilledPriority(null);
      }
    }
  }, [prefilledCategory, prefilledPriority, setPrefilledCategory, setPrefilledPriority]);

  // Voice description recording state
  const [isRecording, setIsRecording] = useState(false);

  // AI Triage State
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // AI Analysis Handler
  const handleAIAnalyze = async () => {
    if (!title && !description) {
      showToast('Please type a title or description first for AI analysis.', 'warning');
      return;
    }

    try {
      setAnalyzingWithAI(true);
      const res = await api.analyzeIssue({
        title,
        description,
        location: `${building} ${roomOrArea}`
      });

      setAiResult(res.aiResult);
      if (res.aiResult.category) {
        setCategory(res.aiResult.category);
      }
      if (res.aiResult.priority) {
        setPriority(res.aiResult.priority);
      }
      if (res.duplicateWarning) {
        setDuplicateWarning(res.duplicateWarning);
      }
      showToast('AI analysis complete! Categorization & priority adjusted.', 'success');
    } catch (err) {
      showToast('AI analysis error, but you can still submit normally.', 'info');
    } finally {
      setAnalyzingWithAI(false);
    }
  };

  const handleVoiceTranscriptionComplete = (transcription: string) => {
    setDescription(prev => prev ? `${prev.trim()}\n${transcription.trim()}` : transcription.trim());
    showToast('Voice transcription attached to description!', 'success');
  };

  const handleCameraPhotoCapture = (imageDataUrl: string) => {
    setImageUrl(imageDataUrl);
    showToast('Live photo captured and attached!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be under 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        showToast('Image uploaded successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide an issue title and description.', 'warning');
      return;
    }

    if (!user) {
      showToast('Please log in to submit a campus report.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const fullLocation = roomOrArea ? `${building} - ${roomOrArea}` : building;
      const res = await api.createReport({
        title,
        category,
        description,
        location: fullLocation,
        building,
        roomOrArea,
        priority,
        imageUrl,
        reporterId: user.id
      }, user);

      setSubmittedReportId(res.report.id);
      showToast('Your report has been submitted! 🎉', 'success');
      await refreshReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRoomOrArea('');
    setImageUrl('');
    setAiResult(null);
    setDuplicateWarning(null);
    setSubmittedReportId(null);
    setScannedTagInfo(null);
  };

  // SUCCESS SUBMISSION SCREEN
  if (submittedReportId) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-in zoom-in-95 duration-300">
        <div className="glass-card rounded-[28px] p-8 text-center border border-slate-200/80 dark:border-slate-800 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-4xl mb-4 animate-bounce">
            🎉
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Your report has been submitted!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">
            Campus Operations dispatchers and maintenance staff have received your ticket.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700/80 max-w-md mx-auto">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned Tracking ID</p>
            <p className="text-2xl font-mono font-extrabold text-blue-600 dark:text-cyan-400 mt-1">
              {submittedReportId}
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+50 Campus Impact Points Awarded!</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setTrackingTicketId(submittedReportId);
                setCurrentView('track');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Track Ticket Progress Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* HEADER: 3D Student Visual Pointing to Form */}
      <div className="relative overflow-hidden rounded-[28px] glass-panel p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>AI-Assisted Dispatch Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Spotted Something That Needs Fixing?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Describe the problem or snap a photo. CampusFix AI analyzes the severity, routes it to the exact maintenance team, and keeps you updated.
          </p>
        </div>

        {/* 3D Student avatar pointing towards form */}
        <div className="shrink-0 relative">
          <img
            src="/src/assets/images/campus_hero_student_1790383682884.jpg"
            alt="Student Helper"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-xl transform rotate-1 hover:rotate-0 transition-transform"
          />
        </div>
      </div>

      {/* MAIN TWO-COLUMN FORM & LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: THE ACTUAL REPORT FORM */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-5">
            
            {/* Device Hardware Permission Status & Quick Access */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Microphone & Camera Permissions
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enable live photo capture, QR scanning, and voice typing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-cyan-300 bg-white dark:bg-slate-750 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-600 shadow-2xs transition-all active:scale-95 shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Device Access Settings</span>
              </button>
            </div>

            {/* Quick Action Active Preset Alert */}
            {quickActionNotice && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-900 dark:text-cyan-200 block">
                      Quick Action Preset: {quickActionNotice}
                    </span>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Category pre-configured. Specify building location & description to dispatch.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickActionNotice(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Title & AI Smart Analyze Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAIAnalyze}
                  disabled={analyzingWithAI || (!title && !description)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 dark:hover:bg-cyan-900/80 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-all disabled:opacity-50"
                  title="Auto-categorize and suggest priority with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: analyzingWithAI ? '1s' : '0s' }} />
                  <span>{analyzingWithAI ? 'Analyzing...' : 'AI Smart Triage'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water leak under sink in Hostel Block B washroom"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* AI Warning or Duplicate banner if detected */}
            {aiResult && (
              <div className="p-3.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-900 dark:text-cyan-200">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>AI Recommendation: {aiResult.suggestedDepartment}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{aiResult.summary}</p>
                {aiResult.safetyWarning && (
                  <div className="mt-1 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{aiResult.safetyWarning}</span>
                  </div>
                )}
              </div>
            )}

            {duplicateWarning && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Possible duplicate ticket already open: </span>
                  <span>"{duplicateWarning.title}" ({duplicateWarning.id}) at {duplicateWarning.location}. You can still submit if this is a separate issue.</span>
                </div>
              </div>
            )}

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ReportPriority)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="Low">Low - Cosmetic or non-urgent</option>
                  <option value="Medium">Medium - Regular maintenance</option>
                  <option value="High">High - Disrupting lectures/study</option>
                  <option value="Urgent">Urgent - Hazard, water leak, electrical</option>
                </select>
              </div>
            </div>

            {/* Location & Building */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Location & Campus Area
                  </label>
                </div>

                {/* Scan Infrastructure QR Code Button */}
                <button
                  type="button"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Infrastructure QR</span>
                </button>
              </div>

              {/* Scanned Location Banner */}
              {scannedTagInfo && (
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>Auto-populated from code: <strong>{scannedTagInfo}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannedTagInfo(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Campus Building
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    {campusBuildings.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Specific Room or Area
                  </label>
                  <input
                    type="text"
                    value={roomOrArea}
                    onChange={(e) => setRoomOrArea(e.target.value)}
                    placeholder="e.g. 2nd Floor, Room 204 or East Corridor"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Description & Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Description & Details <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 active:scale-95 shadow-2xs"
                  title="Record audio with your device microphone to dictate issue description"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>Microphone Dictation</span>
                </button>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is broken, how long it has been an issue, and any safety concerns..."
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Image Upload, Live Camera & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Attach Photo Evidence
                </label>
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 active:scale-95 shadow-2xs"
                  title="Open device camera to snap live photo"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Take Live Photo</span>
                </button>
              </div>

              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48">
                  <img src={imageUrl} alt="Uploaded issue" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Live Camera Option Card */}
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-2xl hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Open Camera
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Capture directly from device
                      </span>
                    </button>

                    {/* File Upload Option Card */}
                    <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Upload Image
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Sample test presets */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Quick Test Images: </span>
                    <div className="inline-flex flex-wrap gap-1.5 mt-1">
                      {sampleImagePresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Submitting will lodge your ticket with Campus Operations.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Submit Report →</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COL: LIVE TICKET PREVIEW CARD */}
        <div className="space-y-4">
          <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 sticky top-22">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Eye className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Live Ticket Preview
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {/* Preview image */}
              {imageUrl ? (
                <div className="rounded-xl overflow-hidden h-36 bg-slate-100 dark:bg-slate-800">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-xl h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                  No photo attached
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                    {category}
                  </span>
                  <PriorityBadge priority={priority} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {title || 'Untitled Issue'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                  {description || 'No description entered yet.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{building}</span>
                </div>
                {roomOrArea && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area/Room:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{roomOrArea}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Reporter:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name || 'Student'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Initial Status:</span>
                  <span className="font-semibold text-amber-600">Pending</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center pt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Earn +50 points upon verified submission</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Scanner Modal */}
      <QRCodeScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        campusBuildings={campusBuildings}
      />

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraPhotoCapture}
        onOpenPermissionsGuide={() => setIsPermissionsModalOpen(true)}
      />

      {/* Microphone Voice Dictation Modal */}
      <AudioVoiceRecordModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptionComplete={handleVoiceTranscriptionComplete}
        onOpenPermissionsGuide={() => setIsPermissionsModalOpen(true)}
      />

      {/* Device Hardware Permissions Modal */}
      <DevicePermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

    </div>
  );
};
