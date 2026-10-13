import React from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Download,
  Share2,
} from "lucide-react";

export default function MyTicketsPage() {
  const seededTickets = [
    {
      id: "reg-1",
      eventTitle: "HackSRM 2026: 36-Hour National Flagship Hackathon",
      status: "ATTENDED",
      ticketToken: "CP-TKT-7F9C8D4B12E0FA5319A64821CB99DE3A",
      venue: "Tech Park Mini Auditorium (4th Floor)",
      campus: "SRM-KTR (Main Campus)",
      date: "Saturday, Oct 24, 2026",
      time: "9:00 AM IST",
      attendee: "Santhosh Kumar",
      studentId: "RA2311003010512",
      seatType: "Official Hacker Pass",
      checkedInAt: "Oct 24, 2026 • 8:45 AM (Gate 2)",
      qrMatrix: "hack-pass-qr",
    },
    {
      id: "reg-3",
      eventTitle: "GrooveMania 2026: Intra-College Dance Showcase",
      status: "CONFIRMED",
      ticketToken: "CP-TKT-3B19AA774C910FD56A88921BCE4401AA",
      venue: "Dr. T. P. Ganesan Auditorium (Main Hall)",
      campus: "SRM-KTR (Main Campus)",
      date: "Monday, Oct 19, 2026",
      time: "5:00 PM IST",
      attendee: "Santhosh Kumar",
      studentId: "RA2311003010512",
      seatType: "Audience Pass (Balcony Block B)",
      checkedInAt: null,
      qrMatrix: "dance-pass-qr",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Event Discovery</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>SRM Verified Student Passes</span>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Your Passes & Tickets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Present your QR ticket at the campus entry gate for fast-track check-in.
        </p>
      </div>

      {/* Tickets List: Apple Wallet / Luma Pass Silhouette */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {seededTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="luma-card rounded-3xl overflow-hidden border border-slate-200 shadow-md flex flex-col justify-between"
          >
            {/* Upper Pass Section */}
            <div className="p-6 sm:p-7 space-y-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[10px] font-black uppercase tracking-wider text-indigo-700">
                  {ticket.seatType}
                </span>

                {ticket.status === "ATTENDED" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Attended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Valid Pass
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900 leading-snug">
                  {ticket.eventTitle}
                </h2>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">{ticket.campus}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    {ticket.date} • {ticket.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ticket.venue}</span>
                </div>
              </div>
            </div>

            {/* Perforation Divider */}
            <div className="relative flex items-center justify-between px-2 bg-slate-50">
              <div className="h-5 w-5 -ml-4 rounded-full bg-[#F9FAFB] border-r border-slate-200" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
              <div className="h-5 w-5 -mr-4 rounded-full bg-[#F9FAFB] border-l border-slate-200" />
            </div>

            {/* Lower Pass Section: QR Matrix & Security Hash */}
            <div className="p-6 sm:p-7 bg-slate-50/70 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <svg
                  viewBox="0 0 100 100"
                  className="w-32 h-32 text-slate-900"
                  fill="currentColor"
                  shapeRendering="crispEdges"
                >
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
                <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                  {ticket.ticketToken}
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {ticket.attendee} • {ticket.studentId}
                </p>
                {ticket.checkedInAt && (
                  <p className="text-[11px] font-semibold text-emerald-600">
                    Checked in at {ticket.checkedInAt}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-[11px] font-semibold transition-all shadow-sm"
                >
                  <Download className="h-3 w-3" />
                  <span>Save Pass</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-[11px] font-semibold transition-all shadow-sm"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
