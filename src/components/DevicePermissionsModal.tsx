import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  ShieldCheck, 
  ExternalLink, 
  RotateCw,
  Sliders,
  Lock
} from 'lucide-react';

interface DevicePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted?: () => void;
}

export type PermissionStateStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  isOpen,
  onClose,
  onPermissionsGranted
}) => {
  const [cameraStatus, setCameraStatus] = useState<PermissionStateStatus>('prompt');
  const [micStatus, setMicStatus] = useState<PermissionStateStatus>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [testingDevice, setTestingDevice] = useState<'both' | 'camera' | 'mic' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check current permission status via navigator.permissions if available
  const checkPermissions = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const camQuery = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraStatus(camQuery.state as PermissionStateStatus);
          camQuery.onchange = () => setCameraStatus(camQuery.state as PermissionStateStatus);
        } catch (e) {
          // 'camera' name might not be supported in some browsers (e.g. Firefox)
        }

        try {
          const micQuery = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicStatus(micQuery.state as PermissionStateStatus);
          micQuery.onchange = () => setMicStatus(micQuery.state as PermissionStateStatus);
        } catch (e) {
          // 'microphone' name might not be supported in some browsers
        }
      }
    } catch (err) {
      console.warn('Error querying permissions API:', err);
    }
  };

  const stopActiveStream = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setMicLevel(0);
    setTestingDevice(null);
  };

  // Request both camera and microphone permissions directly
  const requestBothPermissions = async () => {
    setIsRequesting(true);
    setStatusMessage(null);
    stopActiveStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser or current window environment does not support media device access.');
      }

      // Prompt browser native permissions for both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      activeStreamRef.current = stream;
      setCameraStatus('granted');
      setMicStatus('granted');
      setTestingDevice('both');
      setStatusMessage('Camera and Microphone permissions have been successfully granted! ✅');

      // Hook up video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.setAttribute('playsinline', 'true');
        videoPreviewRef.current.play().catch(() => {});
      }

      // Hook up audio meter
      setupAudioMeter(stream);

      if (onPermissionsGranted) {
        onPermissionsGranted();
      }
    } catch (err: any) {
      console.warn('Permission request error:', err);
      // Attempt separate requests to identify which was denied or if permissions need browser bar change
      await testIndividualDevices();
    } finally {
      setIsRequesting(false);
    }
  };

  const testIndividualDevices = async () => {
    let camGranted = false;
    let micGranted = false;

    // Test camera alone
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      camStream.getTracks().forEach(t => t.stop());
      setCameraStatus('granted');
      camGranted = true;
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
      }
    }

    // Test mic alone
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStream.getTracks().forEach(t => t.stop());
      setMicStatus('granted');
      micGranted = true;
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setMicStatus('denied');
      }
    }

    if (camGranted && micGranted) {
      setStatusMessage('Both Camera and Microphone are allowed! 🎉');
    } else if (camGranted) {
      setStatusMessage('Camera allowed, but microphone permission was not granted.');
    } else if (micGranted) {
      setStatusMessage('Microphone allowed, but camera permission was not granted.');
    } else {
      setStatusMessage('Access was not granted. Please see the instructions below to enable access in your browser.');
    }
  };

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio meter setup failed', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkPermissions();
    } else {
      stopActiveStream();
    }
    return () => {
      stopActiveStream();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Camera & Microphone Permissions
              </h3>
              <p className="text-xs text-slate-500">
                Required for taking photo evidence, scanning QR codes, and voice dictation
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

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3">
          {/* Camera Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Camera className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span className="text-xs font-bold">Camera</span>
              </div>
              {cameraStatus === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Allowed
                </span>
              ) : cameraStatus === 'denied' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3 h-3" /> Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Needs Permission
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Photos of damaged items & campus infrastructure QR plaques
            </p>
          </div>

          {/* Microphone Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Mic className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold">Microphone</span>
              </div>
              {micStatus === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Allowed
                </span>
              ) : micStatus === 'denied' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3 h-3" /> Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Needs Permission
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Speech-to-text dictation for fast issue reporting on mobile & desktop
            </p>
          </div>
        </div>

        {/* Live Device Hardware Tester Preview if Active */}
        {testingDevice && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Hardware Test Preview
              </span>
              <button
                type="button"
                onClick={stopActiveStream}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Stop Preview
              </button>
            </div>

            {/* Video preview */}
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-800">
              <video
                ref={videoPreviewRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>

            {/* Live Mic volume visualizer */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Mic className="w-3 h-3 text-rose-400" />
                  Voice Input Level:
                </span>
                <span className="font-mono text-emerald-400 font-bold">{micLevel}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusMessage.includes('✅') || statusMessage.includes('🎉')
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Primary Action Button: Request Both Permissions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={requestBothPermissions}
            disabled={isRequesting}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isRequesting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Requesting Browser Access...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {cameraStatus === 'granted' && micStatus === 'granted'
                    ? 'Re-test Camera & Microphone'
                    : 'Prompt & Allow Camera & Microphone Access'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Browser Settings Guide if Blocked or Inside Iframe */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>How to enable permissions in your browser:</span>
          </div>

          <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] list-disc pl-4">
            <li>
              <strong>Chrome / Edge:</strong> Click the <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-slate-200 dark:bg-slate-700 rounded font-semibold"><Lock className="w-2.5 h-2.5 inline" /> Lock</span> or <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-slate-200 dark:bg-slate-700 rounded font-semibold"><Sliders className="w-2.5 h-2.5 inline" /> Tune</span> icon on the left side of your browser address bar. Set <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.
            </li>
            <li>
              <strong>Safari:</strong> Click <em>Safari &gt; Settings for This Website</em> &gt; choose <em>Allow</em> for Camera and Microphone.
            </li>
            <li>
              <strong>Mobile (iOS/Android):</strong> When prompted by the browser popup, tap <strong>"Allow"</strong>. If previously blocked, open browser site settings and reset permissions.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={checkPermissions}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Permission Status</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
