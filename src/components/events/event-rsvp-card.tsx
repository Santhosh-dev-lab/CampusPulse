"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  XCircle,
} from "lucide-react";

interface EventRsvpCardProps {
  eventId: string;
  initialCapacity: number;
  initialRegistered: number;
  venueName: string;
}

export function EventRsvpCard({
  eventId,
  initialCapacity,
  initialRegistered,
  venueName,
}: EventRsvpCardProps) {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [registered, setRegistered] = useState(initialRegistered);
  const [isRegistered, setIsRegistered] = useState(false);
  const [ticketToken, setTicketToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check registration status for current user on mount
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/events/${eventId}/register`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success) {
          setIsRegistered(data.isRegistered);
          if (data.registration?.ticketToken) {
            setTicketToken(data.registration.ticketToken);
          }
          if (typeof data.spotsLeft === "number") {
            setRegistered(capacity - data.spotsLeft);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not query registration status:", err);
      })
      .finally(() => {
        if (isMounted) setCheckingStatus(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, capacity]);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register for event");
      }

      setIsRegistered(true);
      setTicketToken(data.ticketToken);
      setRegistered((prev) => Math.min(capacity, prev + 1));
      setSuccessMsg("Registration confirmed! Your QR pass has been generated.");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not complete registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your pass for this event?")) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel registration");
      }

      setIsRegistered(false);
      setTicketToken(null);
      setRegistered((prev) => Math.max(0, prev - 1));
      setSuccessMsg("Registration cancelled. Your spot has been released.");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not cancel registration.");
    } finally {
      setLoading(false);
    }
  };

  const spotsLeft = Math.max(0, capacity - registered);
  const percentFilled = Math.min(100, Math.round((registered / capacity) * 100));

  return (
    <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-lime-400 block">
            Campus Pass
          </span>
          <h3 className="text-lg font-black text-white">Event Registration</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-black">
          FREE
        </span>
      </div>

      {/* Capacity Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60 font-medium">Capacity Filled</span>
          <span className="font-bold text-white">
            {registered} / {capacity} seats ({percentFilled}%)
          </span>
        </div>
        <div className="w-full bg-[#1b2230] rounded-full h-2 overflow-hidden">
          <div
            className="bg-lime-400 h-2 rounded-full transition-all duration-700"
            style={{ width: `${percentFilled}%` }}
          />
        </div>
        <p className="text-[11px] text-white/40 text-right">
          {spotsLeft > 0 ? `${spotsLeft} tickets available for this session` : "Event is at full capacity"}
        </p>
      </div>

      {/* Ticket Features Bullet List */}
      <div className="space-y-2.5 py-2 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
          <span>Instant Apple Wallet style high-contrast QR pass</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
          <span>Fast lane gate check-in at {venueName}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
          <span>OD Attendance credit granted via DSA approval</span>
        </div>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      {checkingStatus ? (
        <div className="w-full py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
          <span>Checking Pass Status...</span>
        </div>
      ) : isRegistered ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-center space-y-1">
            <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider block">
              ✓ Registered & Confirmed
            </span>
            <p className="text-xs text-white font-medium">
              You hold a valid campus pass for this event.
            </p>
            {ticketToken && (
              <span className="text-[10px] font-mono text-white/50 block truncate">
                Token: {ticketToken}
              </span>
            )}
          </div>

          <Link
            href="/my-tickets"
            className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-sm tracking-tight transition-all active:scale-[0.99] shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ticket className="h-4 w-4" />
            <span>View Ticket & QR Pass</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-rose-400/30 text-white/50 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            <span>Cancel Registration</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading || spotsLeft === 0}
          onClick={handleRegister}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] shadow-xl flex items-center justify-center gap-2 ${
            spotsLeft === 0
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-white hover:bg-lime-400 text-black hover:shadow-2xl cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              <span>Reserving Your Seat...</span>
            </>
          ) : spotsLeft === 0 ? (
            <span>Sold Out (Full Capacity)</span>
          ) : (
            <>
              <Ticket className="h-4 w-4" />
              <span>Register & Get Campus Pass</span>
            </>
          )}
        </button>
      )}

      <p className="text-[10px] text-white/40 text-center leading-relaxed">
        By registering, you confirm attendance under SRM IST Ramapuram campus conduct regulations.
      </p>
    </div>
  );
}
