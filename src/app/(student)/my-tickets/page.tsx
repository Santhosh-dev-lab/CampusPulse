import React from "react";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";

export default function MyTicketsPage() {
  const seededTickets = [
    {
      id: "reg-1",
      eventTitle: "HackSRM 2026: 36-Hour National Flagship Hackathon",
      status: "ATTENDED",
      ticketToken: "CP-TKT-7F9C8D4B12E0FA5319A64821CB99DE3A",
      venue: "Tech Park Mini Auditorium (4th Floor)",
      date: "Oct 24, 2026 • 9:00 AM IST",
      attendee: "Santhosh Kumar (RA2311003010512)",
      seatType: "General Participant (Hacker Pass)",
      checkedInAt: "Oct 24, 2026 • 8:45 AM (Gate 2)",
    },
    {
      id: "reg-3",
      eventTitle: "GrooveMania 2026: Intra-College Dance Showcase",
      status: "CONFIRMED",
      ticketToken: "CP-TKT-3B19AA774C910FD56A88921BCE4401AA",
      venue: "Dr. T. P. Ganesan Auditorium (Main Hall)",
      date: "Oct 19, 2026 • 5:00 PM IST",
      attendee: "Santhosh Kumar (RA2311003010512)",
      seatType: "Audience Pass (Balcony Block B)",
      checkedInAt: null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Event Discovery
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Event Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Present the QR ticket at the campus entry gate for fast-track check-in.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>SRM Verified Student Pass</span>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seededTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Top Pass Header */}
            <div className="p-6 border-b border-dashed border-slate-200 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {ticket.seatType}
                </span>

                {ticket.status === "ATTENDED" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Attended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Active Pass
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {ticket.eventTitle}
              </h2>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{ticket.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{ticket.venue}</span>
                </div>
              </div>
            </div>

            {/* QR Code Presentation */}
            <div className="p-6 bg-slate-50/70 flex flex-col items-center justify-center text-center space-y-4">
              {/* QR Container */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <svg
                  viewBox="0 0 100 100"
                  className="w-32 h-32 text-slate-900"
                  fill="currentColor"
                  shapeRendering="crispEdges"
                >
                  {/* Styled High-Fidelity SVG QR Matrix */}
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="4" y="4" width="22" height="22" fill="#fff" />
                  <rect x="8" y="8" width="14" height="14" fill="currentColor" />
                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="74" y="4" width="22" height="22" fill="#fff" />
                  <rect x="78" y="8" width="14" height="14" fill="currentColor" />
                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                  <rect x="4" y="74" width="22" height="22" fill="#fff" />
                  <rect x="8" y="78" width="14" height="14" fill="currentColor" />
                  <rect x="36" y="8" width="8" height="8" fill="currentColor" />
                  <rect x="48" y="16" width="14" height="8" fill="currentColor" />
                  <rect x="36" y="36" width="16" height="16" fill="currentColor" />
                  <rect x="58" y="42" width="10" height="18" fill="currentColor" />
                  <rect x="74" y="58" width="16" height="8" fill="currentColor" />
                  <rect x="42" y="72" width="18" height="14" fill="currentColor" />
                  <rect x="72" y="78" width="18" height="12" fill="currentColor" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  {ticket.ticketToken}
                </p>
                <p className="text-[11px] font-semibold text-slate-800">{ticket.attendee}</p>
                {ticket.checkedInAt && (
                  <p className="text-[10px] text-emerald-600 font-medium">
                    Checked in at {ticket.checkedInAt}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
