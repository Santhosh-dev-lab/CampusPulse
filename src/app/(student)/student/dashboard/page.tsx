import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import { RegistrationStatus } from "@prisma/client";
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  // Fetch student's registrations
  const registrations = await prisma.registration.findMany({
    where: {
      userId: user.id,
      status: {
        not: RegistrationStatus.CANCELLED,
      },
    },
    include: {
      event: {
        include: {
          venue: true,
          campus: true,
          organizerClub: true,
        },
      },
      checkIn: true,
    },
    orderBy: {
      event: {
        startTime: "asc",
      },
    },
  });

  const activePasses = registrations.filter((r) => !r.checkIn);
  const attendedPasses = registrations.filter((r) => Boolean(r.checkIn));

  // Next up event
  const nextEvent = activePasses[0]?.event ?? null;
  const nextStartTime = nextEvent ? new Date(nextEvent.startTime) : null;

  // Recommended upcoming events at their campus
  const recommendedEvents = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      id: {
        notIn: registrations.map((r) => r.eventId),
      },
    },
    include: {
      venue: true,
      organizerClub: true,
    },
    orderBy: {
      startTime: "asc",
    },
    take: 3,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Student Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hello, {user.name || "Student"}!
          </h1>
          <p className="text-xs text-white/50">
            SRM-RMP • {user.email} • ID: {(user as any).studentId || "RA2311003010512"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/my-tickets"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold transition-all shadow-lg active:scale-95"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>View All Passes</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all"
          >
            <span>Explore Events</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              Active Passes
            </span>
            <div className="h-8 w-8 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activePasses.length}</div>
          <p className="text-[11px] text-white/40">Ready for entrance gate verification</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              Attended Events
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{attendedPasses.length}</div>
          <p className="text-[11px] text-white/40">Verified gate scan records</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#12161f] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              OD Attendance Credits
            </span>
            <div className="h-8 w-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{attendedPasses.length * 4} Hours</div>
          <p className="text-[11px] text-white/40">DSA approved on-duty academic credit</p>
        </div>
      </div>

      {/* Next Up Spotlight or Empty State */}
      {nextEvent && nextStartTime ? (
        <div className="rounded-3xl bg-gradient-to-r from-[#12161f] to-[#171f2d] border border-lime-400/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-400 text-black text-[10px] font-black uppercase">
                <span>Next Up On Your Calendar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{nextEvent.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-lime-400" />
                  <span>
                    {nextStartTime.toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-lime-400" />
                  <span>
                    {nextStartTime.toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    IST
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-lime-400" />
                  <span>{nextEvent.venue?.name || "Campus Venue"}</span>
                </div>
              </div>
            </div>

            <Link
              href="/my-tickets"
              className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs shadow-xl flex items-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <Ticket className="h-4 w-4" />
              <span>Show QR Ticket Pass</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 2-Column Section: Active Passes & Recommended Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Your Registered Passes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Ticket className="h-4 w-4 text-lime-400" />
              <span>Your Registered Event Passes</span>
            </h3>
            <Link
              href="/my-tickets"
              className="text-xs text-lime-400 hover:underline font-semibold"
            >
              View QR Cards
            </Link>
          </div>

          {registrations.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#12161f] border border-white/10 text-center space-y-3">
              <Ticket className="h-8 w-8 text-white/30 mx-auto" />
              <p className="text-xs text-white/50">You don&apos;t have any active event passes yet.</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
              >
                Browse Campus Events
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg) => {
                const startTime = new Date(reg.event.startTime);
                const isAttended = Boolean(reg.checkIn);

                return (
                  <div
                    key={reg.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#12161f] border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white hover:text-lime-300">
                          {reg.event.title}
                        </span>
                        {isAttended ? (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Attended
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                            Confirmed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/50">
                        {reg.event.venue?.name || "Campus Venue"} •{" "}
                        {startTime.toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <Link
                      href="/my-tickets"
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-lime-400/40 text-white/70 hover:text-white bg-white/5 text-xs font-semibold shrink-0"
                    >
                      View Pass
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Discover & Recommend */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-lime-400" />
              <span>Recommended For You</span>
            </h3>
            <Link href="/" className="text-xs text-lime-400 hover:underline font-semibold">
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-[#12161f] border border-white/10 space-y-2 hover:border-lime-400/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/60">
                    {ev.category}
                  </span>
                  <span className="text-[10px] text-lime-400 font-semibold">
                    {Math.max(0, ev.capacity - ev.registeredCount)} spots left
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{ev.title}</h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-white/40">{ev.venue?.name}</span>
                  <Link
                    href={`/events/${ev.id}`}
                    className="text-xs font-bold text-lime-400 hover:underline flex items-center gap-1"
                  >
                    <span>RSVP</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
