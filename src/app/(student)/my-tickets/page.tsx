"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Download,
  Share2,
  Loader2,
  Ticket as TicketIcon,
  XCircle,
  Zap,
} from "lucide-react";

interface TicketData {
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug?: string;
  category: string;
  status: string;
  ticketToken: string;
  venue: string;
  building: string;
  campus: string;
  campusCode: string;
  date: string;
  time: string;
  attendee: string;
  studentId: string;
  email: string;
  seatType: string;
  checkedInAt: string | null;
  checkInMethod: string | null;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/me/tickets");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSimulateCheckIn = async (ticket: TicketData) => {
    try {
      setProcessingId(ticket.id);
      setStatusNotice(null);

      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketToken: ticket.ticketToken,
          checkInMethod: "QR_SCAN",
          notes: "Self-test gate check-in via Student Pass view",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Check-in failed");
      }

      setStatusNotice(`✓ Verified & Checked in: ${ticket.attendee} for "${ticket.eventTitle}"`);
      await loadTickets();
    } catch (err: any) {
      setStatusNotice(`⚠️ Check-in notice: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelTicket = async (ticket: TicketData) => {
    if (!confirm(`Are you sure you want to cancel your pass for "${ticket.eventTitle}"?`)) return;

    try {
      setProcessingId(ticket.id);
      setStatusNotice(null);

      const res = await fetch(`/api/events/${ticket.eventId}/register`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel ticket");
      }

      setStatusNotice(`Pass cancelled for "${ticket.eventTitle}". Spot returned to event capacity.`);
      await loadTickets();
    } catch (err: any) {
      setStatusNotice(`⚠️ Cancellation error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation */}
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
          <span>SRM Verified Student Passes</span>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Your Passes & Tickets
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Present your QR ticket at the campus entry gate for fast-track check-in.
        </p>
      </div>

      {/* Global Status Banner */}
      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-[#12161f] border border-white/10 text-white text-xs flex items-center justify-between shadow-lg">
          <span>{statusNotice}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-white/40 hover:text-white text-xs ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400 mx-auto" />
          <p className="text-xs text-white/50 font-medium">Fetching verified campus passes...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-[#12161f] border border-white/10 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40">
            <TicketIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No active event passes</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              You haven&apos;t registered for any events yet. Explore upcoming hackathons, fests, and workshops at SRM Ramapuram.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <span>Explore Events</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tickets.map((ticket) => {
            const isAttended = ticket.status === "ATTENDED" || Boolean(ticket.checkedInAt);
            const isBusy = processingId === ticket.id;

            return (
              <div
                key={ticket.id}
                className="rounded-3xl overflow-hidden border border-white/10 bg-[#12161f] shadow-2xl flex flex-col justify-between group transition-all"
              >
                {/* Upper Pass Section */}
                <div className="p-6 sm:p-7 space-y-4 bg-[#141924]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-wider text-lime-400">
                      {ticket.seatType}
                    </span>

                    {isAttended ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Attended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                        <CheckCircle2 className="h-3 w-3 text-lime-400" />
                        Valid Pass
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-white leading-snug">
                      {ticket.eventTitle}
                    </h2>
                    <p className="text-xs text-lime-400 font-semibold mt-0.5">
                      {ticket.campusCode} • {ticket.campus}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-white/60 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span>
                        {ticket.date} • {ticket.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="truncate">{ticket.venue} ({ticket.building})</span>
                    </div>
                  </div>
                </div>

                {/* Perforation Divider */}
                <div className="relative flex items-center justify-between px-2 bg-[#0e121a]">
                  <div className="h-5 w-5 -ml-4 rounded-full bg-[#07090e] border-r border-white/10" />
                  <div className="flex-1 border-t-2 border-dashed border-white/10 mx-2" />
                  <div className="h-5 w-5 -mr-4 rounded-full bg-[#07090e] border-l border-white/10" />
                </div>

                {/* Lower Pass Section: Scannable QR Matrix & Security Hash */}
                <div className="p-6 sm:p-7 bg-[#0e121a] flex flex-col items-center justify-center text-center space-y-4">
                  {/* High Contrast White Container for Scannable QR */}
                  <div className="p-3.5 bg-white rounded-2xl shadow-xl border border-white/20">
                    <QRCodeSVG
                      value={ticket.ticketToken}
                      size={132}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <p className="text-[10px] font-mono tracking-wider text-lime-400 uppercase select-all truncate px-2">
                      {ticket.ticketToken}
                    </p>
                    <p className="text-xs font-bold text-white">
                      {ticket.attendee} • {ticket.studentId}
                    </p>
                    {ticket.checkedInAt && (
                      <p className="text-[11px] font-semibold text-emerald-400">
                        Checked in at {ticket.checkedInAt}
                      </p>
                    )}
                  </div>

                  {/* Pass Controls & Actions */}
                  <div className="w-full pt-2 flex flex-col gap-2">
                    {!isAttended && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleSimulateCheckIn(ticket)}
                        className="w-full py-2.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-black" />
                        )}
                        <span>⚡ Fast-Track Gate Check-In (Demo)</span>
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/events/${ticket.eventId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 text-[11px] font-semibold transition-all shadow-sm"
                      >
                        <span>Event Page</span>
                      </Link>

                      {!isAttended && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCancelTicket(ticket)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-300/80 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Cancel Pass</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
