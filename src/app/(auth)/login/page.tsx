"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Users,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const DEMO_PERSONAS = [
  {
    role: "STUDENT",
    title: "Student Persona",
    name: "Santhosh Kumar",
    email: "santhosh.student@srmist.edu.in",
    meta: "CSE • 2nd Year • SRM-RMP",
    icon: GraduationCap,
    badgeColor: "bg-lime-400/20 text-lime-400 border-lime-400/30",
    destination: "/student/dashboard",
    description: "Discover events, RSVP for sessions, access Apple Wallet style QR passes.",
  },
  {
    role: "ORGANIZER",
    title: "Club Lead Profile",
    name: "Aarav Sharma",
    email: "aarav.organizer@srmist.edu.in",
    meta: "GDSC Club Lead • SRM-RMP",
    icon: Users,
    badgeColor: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
    destination: "/club/dashboard",
    description: "Publish campus events, manage venue conflicts, run fast-track gate scanners.",
  },
  {
    role: "ADMIN",
    title: "DSA Administrator",
    name: "Dr. K. S. Arunkumar",
    email: "admin@srmist.edu.in",
    meta: "Directorate of Student Affairs (DSA)",
    icon: Shield,
    badgeColor: "bg-amber-400/20 text-amber-400 border-amber-400/30",
    destination: "/admin/dashboard",
    description: "Approve event proposals, oversee venue capacity, review DSA audit trails.",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [emailInput, setEmailInput] = useState("");
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (email: string, targetRole: string, defaultPath: string) => {
    try {
      setLoadingRole(targetRole);
      setErrorMsg(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: targetRole }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sign in");
      }

      const redirectPath = callbackUrl || defaultPath;
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in.");
    } finally {
      setLoadingRole(null);
    }
  };

  const handleManualEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const lower = emailInput.trim().toLowerCase();
    let detectedRole = "STUDENT";
    let defaultDest = "/student/dashboard";

    if (lower.includes("admin") || lower.includes("dsa")) {
      detectedRole = "ADMIN";
      defaultDest = "/admin/dashboard";
    } else if (lower.includes("organizer") || lower.includes("club") || lower.includes("gdsc")) {
      detectedRole = "ORGANIZER";
      defaultDest = "/club/dashboard";
    }

    handleSignIn(lower, detectedRole, defaultDest);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Brand & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>SRM University Unified Authentication</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Sign In to CampusPulse
        </h1>
        <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
          Choose your SRM campus role below for instant one-click access, or sign in with your official university credentials.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Instant 1-Click Role Access Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
            Fast-Track Access by Role
          </span>
          <span className="text-[11px] text-lime-400 font-semibold">Zero-Password Dev Mode</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {DEMO_PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isCurrentLoading = loadingRole === persona.role;

            return (
              <button
                key={persona.role}
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleSignIn(persona.email, persona.role, persona.destination)}
                className="w-full text-left p-5 rounded-3xl bg-[#12161f] hover:bg-[#181e2b] border border-white/10 hover:border-lime-400/40 shadow-xl transition-all duration-200 group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-lime-400 group-hover:border-lime-400/30 transition-colors shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-lime-300 transition-colors">
                          {persona.name}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${persona.badgeColor}`}
                        >
                          {persona.role}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">{persona.meta}</p>
                      <p className="text-[11px] text-white/40 pt-0.5 leading-relaxed">
                        {persona.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {isCurrentLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-lime-400" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/5 group-hover:bg-lime-400 group-hover:text-black flex items-center justify-center text-white/50 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual SRM Email Login Option */}
      <div className="rounded-3xl bg-[#12161f]/80 border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Sign In with SRM Email</h3>
          <p className="text-xs text-white/50">
            Enter your official university email (e.g., student.rmp@srmist.edu.in)
          </p>
        </div>

        <form onSubmit={handleManualEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="name.dept@srmist.edu.in"
            className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-lime-400"
          />

          <button
            type="submit"
            disabled={Boolean(loadingRole) || !emailInput.trim()}
            className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-lime-400 text-black font-bold text-xs transition-colors shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingRole === "MANUAL" ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span>Sign In to Your Dashboard</span>
          </button>
        </form>
      </div>

      {/* Sign Up Footer */}
      <div className="text-center space-y-2 pt-2">
        <p className="text-xs text-white/50">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-lime-400 hover:text-lime-300 underline underline-offset-4"
          >
            Create SRM Account or Register Club
          </Link>
        </p>
        <p className="text-[11px] text-white/30">
          SRM Institute of Science and Technology • Single Sign-On Architecture
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
