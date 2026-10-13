import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle, XCircle, MapPin, Clock, History, ArrowLeft } from "lucide-react";

export default function AdminApprovalsPage() {
  const pendingProposals = [
    {
      id: "evt-pending-1",
      title: "RoboWars Arena 2026: Intracollegiate Combat Tournament",
      category: "Technical",
      club: "Robotics Society SRM",
      venue: "Java Green Open Amphitheatre",
      requestedDates: "Nov 02, 2026 • 10:00 AM – 6:00 PM",
      capacity: 500,
      description:
        "High-voltage combat bot competition featuring 15kg and 30kg bots. Safety barriers and fire marshals requested.",
    },
    {
      id: "evt-pending-2",
      title: "National Student Satellite Design Symposium",
      category: "Technical / Aerospace",
      club: "SRMSAT Student Initiative",
      venue: "Tech Park Mini Auditorium",
      requestedDates: "Nov 08, 2026 • 2:00 PM – 5:30 PM",
      capacity: 300,
      description:
        "Technical paper presentations on CubeSat communications with keynote from ISRO scientists.",
    },
  ];

  const auditLogs = [
    {
      id: "audit-1",
      eventTitle: "HackSRM 2026 (36hr Hackathon)",
      reviewer: "Dr. K. S. Arunkumar (Dean Student Affairs)",
      action: "APPROVED",
      date: "Oct 10, 2026 • 4:15 PM",
      comments: "Approved with faculty mentor presence requirement for 36hr hackathon.",
    },
    {
      id: "audit-2",
      eventTitle: "GrooveMania 2026 (Dance Showcase)",
      reviewer: "Dr. K. S. Arunkumar (Dean Student Affairs)",
      action: "APPROVED",
      date: "Oct 11, 2026 • 11:30 AM",
      comments: "Approved for TP Ganesan Main Hall. Strict sound cutoff at 9:00 PM.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Administrative Approval Desk
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase">
              2 Proposals Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directorate of Student Affairs (DSA) • Campus Venue & Safety Clearance
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span>Immutable Audit Logging Active</span>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Proposals Awaiting Decision</span>
          <span className="text-xs text-slate-400 font-normal">
            (Rejections strictly require an audit reason)
          </span>
        </h2>

        <div className="space-y-4">
          {pendingProposals.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                      {item.club}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-medium text-slate-500">{item.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{item.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors">
                    <XCircle className="h-3.5 w-3.5" />
                    Reject with Reason
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{item.requestedDates}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{item.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Capacity:</span>
                  <span>{item.capacity} attendees</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Trail Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <History className="h-4 w-4 text-indigo-600" />
          <h2>Recent Approval Audit History</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{log.eventTitle}</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                  {log.action}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic">“{log.comments}”</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Decision by {log.reviewer}</span>
                <span>{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
