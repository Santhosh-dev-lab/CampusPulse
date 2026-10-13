import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import {
  ShieldCheck,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Building,
  QrCode,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  // 1. Pending approval events
  const pendingEvents = await prisma.event.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: {
      venue: true,
      campus: true,
      organizerClub: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Published events count
  const publishedCount = await prisma.event.count({
    where: { status: "PUBLISHED" },
  });

  // 3. Total registrations count
  const totalRegistrations = await prisma.registration.count();

  // 4. Venues count
  const venuesCount = await prisma.venue.count();

  // 5. Recent audit records
  const recentAudits = await prisma.approvalRecord.findMany({
    include: {
      event: true,
      reviewer: true,
    },
    orderBy: { reviewedAt: "desc" },
    take: 5,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Directorate of Student Affairs (DSA) • Administrative Desk</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              DSA Executive Command Center
            </h1>
            <p className="text-xs text-white/50 max-w-xl">
              Official university administration oversight for event approvals, venue safety clearance, and academic OD attendance credit issuance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <QrCode className="h-4 w-4 text-lime-400" />
              <span>Gate QR Scanner</span>
            </Link>

            <Link
              href="/approvals"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Open Approvals Desk</span>
              {pendingEvents.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-black text-amber-300 text-[10px]">
                  {pendingEvents.length} Pending
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Pending Proposals
          </span>
          <div className="text-3xl font-black text-amber-400">{pendingEvents.length}</div>
          <p className="text-[11px] text-white/40">Requiring faculty review</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Approved & Published
          </span>
          <div className="text-3xl font-black text-lime-400">{publishedCount}</div>
          <p className="text-[11px] text-white/40">Active campus events</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Student Registrations
          </span>
          <div className="text-3xl font-black text-white">{totalRegistrations}</div>
          <p className="text-[11px] text-white/40">Verified student passes</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Audited Venues
          </span>
          <div className="text-3xl font-black text-cyan-400">{venuesCount}</div>
          <p className="text-[11px] text-white/40">Monitored for conflicts</p>
        </div>
      </div>

      {/* 2-Column: Urgent Review Queue & Audit Log History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Urgent Review Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Pending Event Clearance Queue</span>
            </h3>
            <Link
              href="/approvals"
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Go to Clearance Desk ({pendingEvents.length})
            </Link>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#12161f] border border-white/10 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">All proposals are up to date</h4>
              <p className="text-xs text-white/50">Zero events waiting in the DSA clearance queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map((ev) => {
                const startTime = new Date(ev.startTime);
                return (
                  <div
                    key={ev.id}
                    className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-3 hover:border-amber-400/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            PENDING
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">
                          Host Club: {ev.organizerClub?.name || "Student Club"} • Venue: {ev.venue?.name}
                        </p>
                      </div>

                      <Link
                        href="/approvals"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shrink-0"
                      >
                        Review Proposal
                      </Link>
                    </div>

                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent DSA Audit History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/50" />
              <span>Recent DSA Audit Decisions</span>
            </h3>
          </div>

          <div className="rounded-3xl bg-[#12161f] border border-white/10 p-5 space-y-4 shadow-xl">
            {recentAudits.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-6">No recent audit records.</p>
            ) : (
              <div className="space-y-3">
                {recentAudits.map((audit) => {
                  const isApproved = audit.action === "APPROVED";
                  return (
                    <div
                      key={audit.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white line-clamp-1">{audit.event.title}</span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.2 rounded-full ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {audit.action}
                        </span>
                      </div>
                      {audit.comments && (
                        <p className="text-[11px] text-white/50 italic line-clamp-2">
                          &ldquo;{audit.comments}&rdquo;
                        </p>
                      )}
                      <div className="text-[10px] text-white/40 flex items-center justify-between pt-1 border-t border-white/[0.04]">
                        <span>Reviewer: {audit.reviewer.name || "DSA Admin"}</span>
                        <span>{new Date(audit.reviewedAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
