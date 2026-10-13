"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  ShieldCheck,
  Search,
  Sparkles,
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
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<any | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    try {
      setLoading(true);
      setErrorNotice(null);
      setLastCheckIn(null);

      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketToken: tokenInput.trim(),
          checkInMethod: "QR_SCAN",
          notes: "Gate Staff Verification at SRM Ramapuram",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Check-in failed");
      }

      setLastCheckIn(data);
      setTokenInput("");

      // Add to local recent check-ins
      setRecentCheckIns((prev) => [
        {
          id: String(Date.now()),
          ticketToken: tokenInput.trim(),
          attendeeName: data.attendeeName,
          studentId: data.studentId,
          checkedInAt: new Date(data.checkedInAt).toLocaleTimeString("en-IN"),
          checkInMethod: "QR_SCAN",
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to process check-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
          <span>Organizer Gate Station • SRM-RMP</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Campus Gate Fast-Track Scanner
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Scan student ticket tokens to verify registration and record attendance in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scanner input */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Token Scanner</h3>
                  <p className="text-[11px] text-white/40">Enter or paste student pass token</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-lime-400/20 text-lime-400 rounded-full border border-lime-400/30">
                ACTIVE GATE
              </span>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
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

            {/* Error banner */}
            {errorNotice && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Check-In Rejected</span>
                  <span>{errorNotice}</span>
                </div>
              </div>
            )}

            {/* Success Verification Card */}
            {lastCheckIn && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    Attendance Confirmed
                  </span>
                  <span className="text-[10px] text-white/50">
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
                  Enter a token on the left or click &quot;Fast-Track Gate Check-In&quot; in My Passes.
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
