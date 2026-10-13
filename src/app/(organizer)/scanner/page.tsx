"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  ShieldCheck,
  Search,
  Camera,
  CameraOff,
  SwitchCamera,
  Upload,
  Keyboard,
  Volume2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface CheckInRecord {
  id: string;
  ticketToken: string;
  attendeeName: string | null;
  studentId: string | null;
  attendeeEmail?: string | null;
  checkedInAt: string;
  checkInMethod: string;
}

export default function GateScannerPage() {
  // Scanner modes: 'camera' | 'manual' | 'upload'
  const [mode, setMode] = useState<"camera" | "manual" | "upload">("camera");

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Check-in states
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<any | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [isCooldown, setIsCooldown] = useState(false);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Play pleasant acoustic chime on scan
  const playScanBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Process check-in for a token
  const processCheckInToken = useCallback(
    async (rawToken: string) => {
      let cleanToken = rawToken.trim();
      if (!cleanToken) return;

      // If full URL was scanned (e.g. https://.../verify/TKT-123), extract token
      if (cleanToken.includes("/")) {
        const parts = cleanToken.split("/");
        cleanToken = parts[parts.length - 1];
      }

      try {
        setLoading(true);
        setErrorNotice(null);
        setLastCheckIn(null);
        setScannedFeedback(cleanToken);

        const res = await fetch("/api/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketToken: cleanToken,
            checkInMethod: "QR_CAMERA",
            notes: "Live Camera Gate Station Scan at SRM Ramapuram",
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Gate verification rejected.");
        }

        playScanBeep();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        setLastCheckIn(data);
        setTokenInput("");

        setRecentCheckIns((prev) => [
          {
            id: String(Date.now()),
            ticketToken: cleanToken,
            attendeeName: data.attendeeName,
            studentId: data.studentId,
            checkedInAt: new Date(data.checkedInAt).toLocaleTimeString("en-IN"),
            checkInMethod: "QR_CAMERA",
          },
          ...prev.slice(0, 9),
        ]);

        // Cooldown for 2.5s before accepting the next scan
        setIsCooldown(true);
        setTimeout(() => {
          setIsCooldown(false);
          setScannedFeedback(null);
        }, 2500);
      } catch (err: any) {
        setErrorNotice(err.message || "Failed to process check-in.");
        setIsCooldown(true);
        setTimeout(() => {
          setIsCooldown(false);
          setScannedFeedback(null);
        }, 2000);
      } finally {
        setLoading(false);
      }
    },
    [playScanBeep]
  );

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser or context.");
      }

      // Enumerate available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setAvailableCameras(videoInputs);
      } catch {
        // Enumerate fallback
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera startup error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings or use manual input."
          : err.message || "Failed to access camera device."
      );
      setCameraActive(false);
    }
  }, [facingMode, selectedDeviceId, stopCamera]);

  // Camera scan loop
  useEffect(() => {
    let active = true;

    const scanFrame = () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        cameraActive &&
        !isCooldown &&
        !loading &&
        video.readyState === video.HAVE_ENOUGH_DATA
      ) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            processCheckInToken(code.data);
            return; // stop scanning while processing/cooldown
          }
        }
      }

      if (cameraActive) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    if (cameraActive && mode === "camera") {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, mode, isCooldown, loading, processCheckInToken]);

  // Handle switching to camera mode
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    processCheckInToken(tokenInput.trim());
  };

  // Handle image upload scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processCheckInToken(code.data);
          } else {
            setErrorNotice("Could not find a valid QR barcode in this image. Please ensure the QR is clear.");
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Event Discovery</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Campus Fast-Track Gate • Organizer & Admin Station</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Camera className="h-7 w-7 text-lime-400" />
            <span>Campus Gate Fast-Track Scanner</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Point your camera at student passes or Google Wallet QR codes to instantly record verified attendance.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-[#12161f] border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "camera"
                ? "bg-lime-400 text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "upload"
                ? "bg-lime-400 text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload QR</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-lime-400 text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Manual Input</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scanner viewport */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Camera View Mode */}
            {mode === "camera" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-lime-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Video Viewfinder
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Flip camera"
                    >
                      <SwitchCamera className="h-3.5 w-3.5" />
                      <span>{facingMode === "environment" ? "Back" : "Front"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                      title="Reload camera"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Video Viewport Container */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />

                  {/* High-tech Viewfinder Overlay */}
                  {cameraActive && !cameraError && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* Targeting Reticle Frame */}
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl border-2 border-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.25)] flex items-center justify-center">
                        {/* 4 Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-lime-400 rounded-tl-xl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-lime-400 rounded-tr-xl" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-lime-400 rounded-bl-xl" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-lime-400 rounded-br-xl" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent shadow-[0_0_12px_#A3E635] animate-bounce opacity-80" />

                        <div className="text-[10px] uppercase font-bold tracking-widest text-lime-400/70 bg-black/50 px-2 py-0.5 rounded-full border border-lime-400/30">
                          Align QR Pass
                        </div>
                      </div>

                      {/* Cooldown / Verified Overlay */}
                      {isCooldown && (
                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-xs flex items-center justify-center animate-in fade-in">
                          <div className="p-4 rounded-2xl bg-black/90 border border-emerald-400 text-center space-y-1 shadow-2xl">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                              Pass Scanned!
                            </span>
                            <span className="text-[10px] text-white/70 font-mono">
                              {scannedFeedback}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loading / Error States in Camera */}
                  {(!cameraActive || cameraError) && (
                    <div className="absolute inset-0 bg-[#0b0e14] flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                      {cameraError ? (
                        <>
                          <CameraOff className="h-10 w-10 text-rose-400" />
                          <div className="space-y-1 max-w-xs">
                            <span className="text-xs font-bold text-white block">Camera Inactive</span>
                            <span className="text-[11px] text-rose-300">{cameraError}</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs cursor-pointer shadow-md"
                            >
                              Retry Camera
                            </button>
                            <button
                              type="button"
                              onClick={() => setMode("manual")}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                            >
                              Use Manual Token
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
                          <span className="text-xs text-white/60">Initializing camera feed...</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-lime-400" />
                    <span>Audible verification chime enabled</span>
                  </div>
                  <span>Continuous 30 FPS Auto-Detection</span>
                </div>
              </div>
            )}

            {/* Upload QR Image Mode */}
            {mode === "upload" && (
              <div className="space-y-4">
                <div className="border-b border-white/[0.08] pb-3">
                  <h3 className="text-sm font-bold text-white">Scan Image or Pass Screenshot</h3>
                  <p className="text-[11px] text-white/40">Select a saved pass screenshot or photo of a QR code</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-white/20 hover:border-lime-400/50 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] text-center cursor-pointer transition-all space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 mx-auto text-lime-400" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      Click to browse or drop QR image
                    </span>
                    <span className="text-[11px] text-white/40 block">
                      Supports JPG, PNG, WEBP screenshots
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Token Input Mode */}
            {mode === "manual" && (
              <div className="space-y-4">
                <div className="border-b border-white/[0.08] pb-3">
                  <h3 className="text-sm font-bold text-white">Manual Pass Token Entry</h3>
                  <p className="text-[11px] text-white/40">Enter the cryptographic token string printed on the pass</p>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                      Ticket Token / Cryptographic Hash
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="e.g. TKT-7F9C8D4B... or paste token"
                        className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-lime-400 font-mono"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={loading || !tokenInput.trim()}
                        className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Search className="h-3.5 w-3.5" />
                        )}
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Error banner */}
            {errorNotice && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Check-In Rejected</span>
                  <span>{errorNotice}</span>
                </div>
              </div>
            )}

            {/* Success Verification Card */}
            {lastCheckIn && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    Attendance Confirmed
                  </span>
                  <span className="text-[10px] text-white/50 font-mono">
                    {new Date(lastCheckIn.checkedInAt).toLocaleTimeString("en-IN")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block">
                      Attendee Name
                    </span>
                    <span className="font-bold text-white text-sm">
                      {lastCheckIn.attendeeName || "Student"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block">
                      SRM Register No.
                    </span>
                    <span className="font-bold text-lime-400 font-mono">
                      {lastCheckIn.studentId || "Verified"}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-emerald-500/20">
                    <span className="text-[10px] text-white/40 uppercase font-bold block">
                      Event Title
                    </span>
                    <span className="font-semibold text-white/90">
                      {lastCheckIn.eventTitle}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent check-ins stream */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-lime-400" />
                <span>Recent Gate Activity</span>
              </h3>
              <span className="text-[10px] text-white/40">Real-Time Stream</span>
            </div>

            {recentCheckIns.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-white/40">
                <QrCode className="h-8 w-8 mx-auto text-white/20" />
                <p className="text-xs">No check-ins recorded in this session yet.</p>
                <p className="text-[11px] text-white/30">
                  Point camera at a student pass QR code or upload a pass screenshot.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCheckIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">
                        {ci.attendeeName || "Student"}
                      </span>
                      <span className="text-[10px] font-mono text-lime-400">
                        {ci.studentId || ci.ticketToken.slice(0, 12)}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50">{ci.checkedInAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
