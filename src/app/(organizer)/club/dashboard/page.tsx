import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import {
  Users,
  Sparkles,
  QrCode,
  Calendar,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClubDashboardPage() {
  const user = await getCurrentUser();

  // Find user's club
  const clubMembership = await prisma.clubMembership.findFirst({
    where: { userId: user.id },
    include: {
      club: {
        include: {
          campus: true,
        },
      },
    },
  });

  const club = clubMembership?.club ?? null;

  // Query events created by this organizer or belonging to their club
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { createdById: user.id },
        ...(club ? [{ organizerClubId: club.id }] : []),
      ],
    },
    include: {
      venue: true,
      campus: true,
      registrations: {
        include: { checkIn: true },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  // Calculate metrics
  let totalCapacity = 0;
  let totalRegistrations = 0;
  let totalCheckedIn = 0;

  events.forEach((ev) => {
    totalCapacity += ev.capacity;
    const regCount = ev.registrations.length;
    totalRegistrations += regCount;
    totalCheckedIn += ev.registrations.filter((r) => Boolean(r.checkIn)).length;
  });

  const attendanceRate =
    totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

  const clubDisplayName = club?.name || "Student Organization Community";
  const clubCategory = club?.category || "Technical";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Club Profile Hero Header */}
      <div className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-3xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 text-2xl font-black shrink-0">
              {clubDisplayName[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  {clubDisplayName}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Club
                </span>
              </div>

              <p className="text-xs text-white/50">
                Lead: <span className="text-white font-semibold">{user.name}</span> • SRM-RMP • {clubCategory}
              </p>
              <p className="text-xs text-white/60 max-w-xl leading-relaxed">
                {club?.description || "Official recognized student organization at SRM Institute of Science and Technology."}
              </p>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Host New Event</span>
            </Link>

            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <QrCode className="h-4 w-4 text-white/70" />
              <span>Gate QR Scanner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Hosted Events
          </span>
          <div className="text-3xl font-black text-white">{events.length}</div>
          <p className="text-[11px] text-white/40">Across SRM campuses</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Registrations
          </span>
          <div className="text-3xl font-black text-white">{totalRegistrations}</div>
          <p className="text-[11px] text-white/40">Active student passes</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Checked-In Attendees
          </span>
          <div className="text-3xl font-black text-emerald-400">{totalCheckedIn}</div>
          <p className="text-[11px] text-white/40">Gate verified attendees</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
            Attendance Rate
          </span>
          <div className="text-3xl font-black text-cyan-400">{attendanceRate}%</div>
          <p className="text-[11px] text-white/40">Turnout efficiency</p>
        </div>
      </div>

      {/* Managed Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>Club Event Portfolio</span>
          </h2>
          <Link
            href="/create"
            className="text-xs text-lime-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>+ Create Draft</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#12161f] border border-white/10 space-y-3">
            <Calendar className="h-10 w-10 text-white/30 mx-auto" />
            <h3 className="text-sm font-bold text-white">No events published yet</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Ready to host your club&apos;s next flagship hackathon or workshop? Launch your first event proposal today.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-lime-400 text-black text-xs font-bold"
            >
              <span>Create Event Proposal</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const regCount = ev.registrations.length;
              const checkedInCount = ev.registrations.filter((r) => Boolean(r.checkIn)).length;
              const percent = ev.capacity > 0 ? Math.min(100, Math.round((regCount / ev.capacity) * 100)) : 0;
              const startTime = new Date(ev.startTime);

              return (
                <div
                  key={ev.id}
                  className="p-5 sm:p-6 rounded-3xl bg-[#12161f] border border-white/10 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-cyan-300">
                          {ev.title}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            ev.status === "PUBLISHED"
                              ? "bg-lime-400/20 text-lime-300 border-lime-400/30"
                              : ev.status === "APPROVED"
                              ? "bg-cyan-400/20 text-cyan-300 border-cyan-400/30"
                              : ev.status === "PENDING_APPROVAL"
                              ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                              : "bg-white/10 text-white/60 border-white/20"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">
                        {ev.venue?.name || "Campus Venue"} •{" "}
                        {startTime.toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {startTime.toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                        IST
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/events/${ev.id}`}
                        className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-white/25 text-white/70 hover:text-white bg-white/5 text-xs font-semibold"
                      >
                        Public Page
                      </Link>
                      <Link
                        href="/scanner"
                        className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <QrCode className="h-3 w-3" />
                        <span>Scan Attendees</span>
                      </Link>
                    </div>
                  </div>

                  {/* Capacity & Check-in Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>
                        Seating: {regCount} / {ev.capacity} seats reserved ({percent}%)
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        Checked-In: {checkedInCount} attendees
                      </span>
                    </div>
                    <div className="w-full bg-[#1b2230] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
