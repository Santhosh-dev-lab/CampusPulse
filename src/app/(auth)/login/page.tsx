"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // Check if user is already logged in
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Authentication Mode: "otp" (Email 6-digit code) vs "password"
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");

  // OTP flow states
  const [otpStep, setOtpStep] = useState<"input_email" | "enter_code">("input_email");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Password flow states
  const [passwordEmail, setPasswordEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Check current session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsCheckingSession(false));
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Send OTP Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const emailToSend = otpEmail.trim().toLowerCase();
    if (!emailToSend) {
      setErrorMsg("Please enter your SRM institutional email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      setOtpStep("enter_code");
      setCountdown(45); // 45 seconds before resend allowed
      setSuccessNotice(`Verification code sent to ${data.email}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP Code & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail.trim().toLowerCase(),
          code: cleanCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed.");
      }

      const targetPath = callbackUrl || data.redirectUrl || "/student/dashboard";
      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwordEmail.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: passwordEmail.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid institutional credentials.");
      }

      const userRole = data.user?.role;
      let targetPath = callbackUrl;

      if (!targetPath) {
        if (userRole === "ADMIN") targetPath = "/admin/dashboard";
        else if (userRole === "ORGANIZER") targetPath = "/club/dashboard";
        else targetPath = "/student/dashboard";
      }

      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Sign out current user
  const handleSignOutCurrent = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.refresh();
  };

  const getDashboardLink = (role: string) => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "ORGANIZER") return "/club/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="max-w-md mx-auto space-y-7 py-8 sm:py-14">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-lime-400" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            CampusPulse
          </span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sign In
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Official SRM University Smart Event Hub & Pass Verification
          </p>
        </div>
      </div>

      {/* Already Signed In Alert Banner */}
      {!isCheckingSession && currentUser && (
        <div className="p-4 rounded-3xl bg-lime-400/10 border border-lime-400/20 text-white text-xs space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider">
              Active Session Detected
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
              {currentUser.role}
            </span>
          </div>

          <div>
            <span className="text-sm font-bold block text-white">{currentUser.name}</span>
            <span className="text-xs text-white/60">{currentUser.email}</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={getDashboardLink(currentUser.role)}
              className="flex-1 py-2 px-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Go to My Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOutCurrent}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-white/70 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Method Selector Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-[#12161f] border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("otp");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMethod === "otp"
              ? "bg-lime-400 text-black shadow-md"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>SRM Email Code</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMethod("password");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMethod === "password"
              ? "bg-lime-400 text-black shadow-md"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Password</span>
        </button>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Notice */}
      {successNotice && !errorMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* METHOD 1: EMAIL OTP (CODE VERIFICATION) */}
      {authMethod === "otp" && (
        <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl">
          {otpStep === "input_email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="e.g. sk1234@srmist.edu.in"
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition-colors"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-white/40">
                  We will send a 6-digit access code to this address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !otpEmail.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs tracking-tight transition-all active:scale-[0.99] shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-black" />
                )}
                <span>Send 6-Digit Code</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Code sent to</span>
                  <span className="font-bold text-white font-mono">{otpEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep("input_email");
                    setOtpCode("");
                    setErrorMsg(null);
                  }}
                  className="text-xs text-lime-400 hover:underline font-semibold cursor-pointer"
                >
                  Change Email
                </button>
              </div>


              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl py-3.5 text-center text-xl font-mono tracking-[0.5em] text-lime-400 placeholder-white/20 focus:outline-none focus:border-lime-400 transition-colors font-bold"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs tracking-tight transition-all active:scale-[0.99] shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-black" />
                )}
                <span>Verify & Sign In</span>
              </button>

              <div className="text-center pt-1">
                {countdown > 0 ? (
                  <span className="text-xs text-white/40">
                    Resend code in <strong className="text-white">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-semibold text-lime-400 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Resend Verification Code</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* METHOD 2: INSTITUTIONAL PASSWORD */}
      {authMethod === "password" && (
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
              Institutional Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-white/40 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                placeholder="e.g. sk1234@srmist.edu.in"
                className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                Password
              </label>
              <span className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-white/40 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs tracking-tight transition-all active:scale-[0.99] shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <ArrowRight className="h-4 w-4 text-black" />
            )}
            <span>Sign In with Password</span>
          </button>

          {/* Mock Credentials Quick Select */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block text-center">
              Quick Fill Mock Credentials
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setPasswordEmail("santhosh.student@srmist.edu.in");
                  setPassword("password123");
                  setErrorMsg(null);
                }}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-semibold text-lime-400 cursor-pointer transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordEmail("aarav.organizer@srmist.edu.in");
                  setPassword("password123");
                  setErrorMsg(null);
                }}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-semibold text-cyan-400 cursor-pointer transition-colors"
              >
                Club Lead
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordEmail("admin@srmist.edu.in");
                  setPassword("password123");
                  setErrorMsg(null);
                }}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-semibold text-amber-400 cursor-pointer transition-colors"
              >
                DSA Admin
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Footer Info */}
      <div className="text-center space-y-2">
        <p className="text-xs text-white/50">
          New to CampusPulse?{" "}
          <Link
            href="/register"
            className="font-bold text-lime-400 hover:text-lime-300 underline underline-offset-4"
          >
            Create an Account
          </Link>
        </p>
        <p className="text-[11px] text-white/30">
          SRM Institute of Science and Technology • Unified Access Portal
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400 mx-auto" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
