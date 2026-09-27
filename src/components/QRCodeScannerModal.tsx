import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  X, 
  Upload, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Zap,
  Building,
  Sparkles,
  Info
} from 'lucide-react';

export interface ScannedLocationData {
  building?: string;
  roomOrArea?: string;
  category?: string;
  code?: string;
  rawText?: string;
}

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ScannedLocationData) => void;
  campusBuildings: string[];
}

// Preset campus infrastructure QR codes for testing / instant simulation
const DEMO_CAMPUS_CODES: {
  code: string;
  label: string;
  building: string;
  roomOrArea: string;
  category?: string;
}[] = [
  {
    code: 'CAMPUS-LIB-204',
    label: 'Library 2nd Floor Study Room 204',
    building: 'Central Library',
    roomOrArea: '2nd Floor, Room 204 (Quiet Study)',
    category: 'Classroom'
  },
  {
    code: 'CAMPUS-TECH-LAB-B',
    label: 'Tech Complex Computer Lab B',
    building: 'Tech & Science Complex',
    roomOrArea: 'Ground Floor, Lab B-012',
    category: 'Laboratory'
  },
  {
    code: 'CAMPUS-HOSTEL-A-FL3',
    label: 'Hostel A 3rd Floor Common Washroom',
    building: 'Hostel Block A',
    roomOrArea: '3rd Floor, West Wing Restroom',
    category: 'Plumbing'
  },
  {
    code: 'CAMPUS-ENG-WRK-01',
    label: 'Engineering Workshop 01 Power Bay',
    building: 'Engineering Workshops',
    roomOrArea: 'Workshop Bay 1, Circuit Panel 4',
    category: 'Electrical'
  },
  {
    code: 'CAMPUS-CANTEEN-MAIN',
    label: 'Student Union Canteen Dining Area',
    building: 'Student Union & Canteen',
    roomOrArea: 'Main Dining Hall, South Counter',
    category: 'Cleanliness'
  },
  {
    code: 'CAMPUS-SPORTS-GYM',
    label: 'Sports Complex Indoor Court 2',
    building: 'Sports Complex & Arena',
    roomOrArea: 'Indoor Basketball Court 2 & Bleachers',
    category: 'Maintenance'
  }
];

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  campusBuildings
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [lastScannedResult, setLastScannedResult] = useState<ScannedLocationData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Parse scanned QR code text into structured location data
  const parseQRCode = (text: string): ScannedLocationData => {
    const trimmed = text.trim();

    // 1. Check if it matches our demo codes
    const demoMatch = DEMO_CAMPUS_CODES.find(
      c => c.code.toLowerCase() === trimmed.toLowerCase()
    );
    if (demoMatch) {
      return {
        building: demoMatch.building,
        roomOrArea: demoMatch.roomOrArea,
        category: demoMatch.category,
        code: demoMatch.code,
        rawText: trimmed
      };
    }

    // 2. Try JSON format: {"building": "...", "room": "...", "category": "..."}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return {
          building: parsed.building || parsed.bldg,
          roomOrArea: parsed.room || parsed.roomOrArea || parsed.area || parsed.location,
          category: parsed.category || parsed.cat,
          code: parsed.code || parsed.id,
          rawText: trimmed
        };
      } catch {
        // continue
      }
    }

    // 3. Try URL format or URI query params: e.g. https://campus.edu/report?bldg=Central+Library&room=Room+101
    if (trimmed.includes('http://') || trimmed.includes('https://') || trimmed.includes('?')) {
      try {
        const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://campus.edu/${trimmed}`);
        const bldgParam = urlObj.searchParams.get('bldg') || urlObj.searchParams.get('building');
        const roomParam = urlObj.searchParams.get('room') || urlObj.searchParams.get('area');
        const catParam = urlObj.searchParams.get('category');
        const codeParam = urlObj.searchParams.get('code');
        if (bldgParam || roomParam) {
          return {
            building: bldgParam || undefined,
            roomOrArea: roomParam || undefined,
            category: catParam || undefined,
            code: codeParam || undefined,
            rawText: trimmed
          };
        }
      } catch {
        // continue
      }
    }

    // 4. Try delimiter-separated formats: e.g. "Central Library | Room 302" or "Tech Complex : Lab 3"
    const separators = ['|', ':', ';', ' - '];
    for (const sep of separators) {
      if (trimmed.includes(sep)) {
        const parts = trimmed.split(sep).map(p => p.trim());
        const matchedBldg = campusBuildings.find(
          b => b.toLowerCase() === parts[0].toLowerCase() || parts[0].toLowerCase().includes(b.toLowerCase())
        );
        return {
          building: matchedBldg || parts[0],
          roomOrArea: parts.slice(1).join(' - '),
          code: trimmed,
          rawText: trimmed
        };
      }
    }

    // 5. Fallback: check if the string contains any known campus building name
    const buildingMatch = campusBuildings.find(b => 
      trimmed.toLowerCase().includes(b.toLowerCase())
    );

    if (buildingMatch) {
      const rest = trimmed.replace(new RegExp(buildingMatch, 'i'), '').trim().replace(/^[-:,|\s]+/, '');
      return {
        building: buildingMatch,
        roomOrArea: rest || 'Scanned Location Area',
        code: trimmed,
        rawText: trimmed
      };
    }

    // 6. Generic asset / location code
    return {
      building: campusBuildings[0] || 'Central Library',
      roomOrArea: trimmed,
      code: trimmed,
      rawText: trimmed
    };
  };

  const handleDetectedCode = (codeText: string) => {
    const data = parseQRCode(codeText);
    setLastScannedResult(data);
    onScanSuccess(data);
    stopCamera();
  };

  // Start live webcam QR scan
  const startCamera = async () => {
    setCameraError(null);
    setScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera video capture is not supported on this browser or device.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraActive(false);
      setScanning(false);
      setCameraError(
        err.message || 'Unable to access camera. Please allow camera permissions or upload an image of the QR code.'
      );
    }
  };

  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleDetectedCode(code.data);
          return;
        }
      }
    }

    if (cameraActive) {
      animFrameId.current = requestAnimationFrame(tickScan);
    }
  };

  // Process uploaded QR code photo
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDetectedCode(code.data);
          } else {
            setCameraError('Could not detect a valid QR code in this image. Please ensure the QR is clear and well-lit.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Close & cleanup
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLastScannedResult(null);
      setCameraError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-cyan-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                Scan Infrastructure QR Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan campus code to auto-populate building & room location
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera Viewfinder or Placeholder */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex flex-col items-center justify-center border border-slate-800 text-white">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay & Corner Guides when camera is active */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-cyan-400 rounded-2xl relative shadow-2xl">
                {/* Scanning laser line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-bounce" />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400 rounded-tl-sm -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400 rounded-tr-sm -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400 rounded-bl-sm -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400 rounded-br-sm -mb-0.5 -mr-0.5" />
              </div>
              <p className="mt-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-cyan-300">
                Point camera at campus pillar, room plaque, or door QR
              </p>
            </div>
          )}

          {/* Fallback state when camera is inactive */}
          {!cameraActive && (
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 mx-auto flex items-center justify-center">
                <Camera className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">
                  Ready to scan campus infrastructure
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Position any campus facility QR plaque to automatically fill the exact building and room.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Live Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Camera active controls */}
        {cameraActive && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Camera scanning active
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              Stop Camera
            </button>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Last Scanned Result Confirmation */}
        {lastScannedResult && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Location Successfully Detected!</span>
            </div>
            <div className="text-slate-700 dark:text-slate-300 pl-6 space-y-0.5">
              <p><strong className="text-slate-900 dark:text-white">Building:</strong> {lastScannedResult.building}</p>
              <p><strong className="text-slate-900 dark:text-white">Room / Area:</strong> {lastScannedResult.roomOrArea}</p>
              {lastScannedResult.category && (
                <p><strong className="text-slate-900 dark:text-white">Suggested Category:</strong> {lastScannedResult.category}</p>
              )}
            </div>
          </div>
        )}

        {/* Instant Campus Code Simulation Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sample Infrastructure QR Codes
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Click to auto-simulate scan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {DEMO_CAMPUS_CODES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleDetectedCode(item.code)}
                className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-100/70 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                    {item.code}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 flex items-center gap-0.5 font-medium">
                    <span>Scan</span>
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                  {item.building}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.roomOrArea}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Supports QR tags, JSON barcodes, and campus URL plaques
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
