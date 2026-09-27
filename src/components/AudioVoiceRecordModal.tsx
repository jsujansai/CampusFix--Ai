import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Volume2, AlertCircle, RefreshCw } from 'lucide-react';

interface AudioVoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (text: string) => void;
  onOpenPermissionsGuide?: () => void;
}

export const AudioVoiceRecordModal: React.FC<AudioVoiceRecordModalProps> = ({
  isOpen,
  onClose,
  onTranscriptionComplete,
  onOpenPermissionsGuide
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const startVoiceCapture = async () => {
    setError(null);
    setTranscript('');
    setRecordingDuration(0);

    // 1. Request actual Microphone permissions via getUserMedia & setup visualizer
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Audio analysis for real-time visualizer waveform
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateLevel);
            }
          };
          updateLevel();
        }
      } catch (audioErr) {
        console.warn('Audio visualization context init skipped', audioErr);
      }

      // 2. Setup Web Speech Recognition if available in the browser
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access was denied. Please allow microphone permissions in your browser bar.');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        // Fallback for browsers without speech recognition API
        setTranscript('Microphone listening... describe the broken equipment, location details, and urgency.');
      }

      setIsRecording(true);

      // Duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.warn('Microphone error:', err);
      setIsRecording(false);
      setError(err.message || 'Microphone access could not be acquired. Please ensure permissions are granted.');
    }
  };

  const stopVoiceCapture = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  const handleApplyTranscript = () => {
    const finalResult = transcript.trim() || 'Urgent repair required: water leakage and structural defect reported.';
    onTranscriptionComplete(finalResult);
    stopVoiceCapture();
    onClose();
  };

  const handleInsertSample = (sample: string) => {
    setTranscript(sample);
  };

  useEffect(() => {
    if (isOpen) {
      startVoiceCapture();
    } else {
      stopVoiceCapture();
      setTranscript('');
      setError(null);
    }
    return () => {
      stopVoiceCapture();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isRecording 
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                : 'bg-blue-600/10 text-blue-600 dark:text-cyan-400'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Microphone Voice Dictation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak directly into your microphone to populate issue details
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

        {/* Audio Visualizer & State */}
        <div className="rounded-2xl bg-slate-950 p-6 flex flex-col items-center justify-center border border-slate-800 text-white min-h-[160px] relative overflow-hidden">
          
          {/* Waveform graphic based on real audio level */}
          <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs mb-3">
            {[...Array(16)].map((_, i) => {
              const variance = Math.sin((i / 16) * Math.PI) * 0.9;
              const barHeight = isRecording 
                ? Math.max(6, Math.min(48, (audioLevel * 0.6 + 8) * variance + (i % 3) * 4))
                : 4;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isRecording 
                      ? 'bg-gradient-to-t from-rose-500 to-amber-400' 
                      : 'bg-slate-800'
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>

          {/* Recording Status Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            {isRecording ? (
              <span className="flex items-center gap-2 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                RECORDING [{formatSeconds(recordingDuration)}]
              </span>
            ) : (
              <span className="text-slate-400">Microphone Paused</span>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs text-center max-w-xs space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => startVoiceCapture()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg"
                >
                  Retry Mic
                </button>
                {onOpenPermissionsGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      stopVoiceCapture();
                      onClose();
                      onOpenPermissionsGuide();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg shadow-xs"
                  >
                    Grant Permission
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Transcription Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Live Voice Transcription:
            </span>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-slate-400 hover:text-slate-600 text-[11px] underline"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Listening for your voice... speak clearly into your device's microphone."
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Quick Voice Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400">Quick voice templates to test:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "The AC in classroom 302 is leaking water onto desks and making a grinding noise.",
              "Main hallway ceiling light on the second floor has burnt out and is hanging loose.",
              "The ground floor water purifier dispenser is blocked and overflowing."
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSample(sample)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 transition-colors text-left"
              >
                "{sample.slice(0, 38)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {isRecording ? (
            <button
              type="button"
              onClick={stopVoiceCapture}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 flex items-center gap-1.5"
            >
              <MicOff className="w-4 h-4" />
              <span>Pause Recording</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceCapture}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-rose-500" />
              <span>Resume Mic</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyTranscript}
              disabled={!transcript.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Description</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
