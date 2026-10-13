import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EventTimelineView } from "@/components/events/event-timeline-view";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Ticket,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fallback demo events dedicated exclusively to SRM Ramapuram, strictly aligned to user timeline dates
const RMP_FEATURED_EVENTS = [
  {
    id: "evt-ai-biotech",
    title: "AI in Clinical Diagnostics: Keynote Lecture & Live Demo",
    slug: "ai-diagnostics-rmp-2026",
    category: "Guest Lecture",
    posterUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Gallery Hall 1",
    startTime: "2026-10-15T09:30:00.000Z", // Oct 15, 2026 (Thursday)
    capacity: 300,
    registeredCount: 140,
    organizerClubName: "Bioengineering Research Society RMP",
  },
  {
    id: "evt-hack-srm",
    title: "HackSRM RMP 2026: 36-Hour National Flagship Hackathon",
    slug: "hacksrm-rmp-2026",
    category: "Hackathon",
    posterUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    venueName: "TRP Auditorium",
    startTime: "2026-10-23T10:00:00.000Z", // Oct 23, 2026 (Friday)
    capacity: 1200,
    registeredCount: 840,
    organizerClubName: "GDSC SRM Ramapuram",
  },
  {
    id: "evt-groove-mania",
    title: "GrooveMania 2026: Ramapuram Intra-College Dance Showcase",
    slug: "groovemania-rmp-2026",
    category: "Cultural Fest",
    posterUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
    venueName: "TRP Auditorium",
    startTime: "2026-11-14T17:00:00.000Z", // Nov 14, 2026 (Saturday)
    capacity: 1200,
    registeredCount: 950,
    organizerClubName: "Groove Crew RMP",
  },
  {
    id: "evt-robowars",
    title: "RoboWars 2026: Combat Bot Arena Clash at Ramapuram",
    slug: "robowars-rmp-2026",
    category: "Technical",
    posterUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    venueName: "Gallery Hall 3",
    startTime: "2026-11-25T11:00:00.000Z", // Nov 25, 2026 (Wednesday)
    capacity: 200,
    registeredCount: 185,
    organizerClubName: "Robotics Club SRM RMP",
  },
  {
    id: "evt-cloud-k8s",
    title: "Cloud Native & Kubernetes Hands-On Masterclass",
    slug: "cloud-native-k8s-rmp-2026",
    category: "Workshops",
    posterUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    venueName: "MLCP Lab 3",
    startTime: "2026-12-04T14:00:00.000Z", // Dec 4, 2026 (Friday)
    capacity: 120,
    registeredCount: 92,
    organizerClubName: "Cloud Computing Cell RMP",
  },
];

interface EventItem {
  id: string;
  title: string;
  slug?: string;
  category: string;
  posterUrl: string | null;
  venueName: string;
  startTime: string;
  capacity: number;
  registeredCount: number;
  organizerClubName: string;
}

export default async function HomePage() {
  // Query live published events from database for SRM-RMP
  let events: EventItem[] = RMP_FEATURED_EVENTS;
  try {
    const dbEvents = await prisma.event.findMany({
      where: {
        campus: {
          code: "SRM-RMP",
        },
      },
      include: {
        venue: true,
        organizerClub: true,
      },
      orderBy: {
        startTime: "asc",
      },
      take: 20,
    });

    if (dbEvents && dbEvents.length > 0) {
      const mappedDbEvents = dbEvents.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        category: e.category,
        posterUrl: e.posterUrl,
        venueName: e.venue?.name ?? "TRP Auditorium",
        startTime: e.startTime.toISOString(),
        capacity: e.capacity,
        registeredCount: e.registeredCount,
        organizerClubName: e.organizerClub?.name ?? "SRM Ramapuram Club",
      }));

      // Combine DB events with baseline events, avoiding duplicate IDs
      const seenIds = new Set(mappedDbEvents.map((e) => e.id));
      const baselineRem = RMP_FEATURED_EVENTS.filter((e) => !seenIds.has(e.id));
      events = [...mappedDbEvents, ...baselineRem].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    }
  } catch (err) {
    console.warn("Could not query DB events for SRM-RMP, using verified fallback:", err);
  }

  const spotlightEvent = events[0] || RMP_FEATURED_EVENTS[0];
  const spotlightDate = new Date(spotlightEvent.startTime);
  const spotlightDateStr = spotlightDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const spotlightTimeStr = spotlightDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="space-y-12">
      {/* =========================================================================
          LUMA SIGNATURE SPOTLIGHT HERO (SRM RAMAPURAM)
         ========================================================================= */}
      <section className="relative rounded-3xl bg-[#0b0e17] text-white overflow-hidden border border-white/10 shadow-2xl">
        {/* Ambient radial blur glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-20 p-8 sm:p-12 lg:p-16 max-w-4xl space-y-6">
          {/* SRM Ramapuram Campus Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-lime-400" />
            <span className="font-bold text-lime-400">SRM-RMP</span>
            <span className="text-white/40">•</span>
            <span>Ramapuram Campus, Chennai</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Delightful events, hosted at SRM Ramapuram.
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
            Discover campus hackathons, dance fests, technical battles, and guest lectures. Instant
            Apple Wallet style passes with zero venue schedule conflicts.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-black text-sm font-bold shadow-lg transition-transform active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Host an Event</span>
            </Link>

            <Link
              href="/my-tickets"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold backdrop-blur-md transition-colors"
            >
              <Ticket className="h-4 w-4 text-white/60" />
              <span>My Passes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SPOTLIGHT FEATURED EVENT (2-Column Cinematic Card)
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-lime-400" />
            <span>Featured at SRM Ramapuram</span>
          </h2>
          <span className="text-xs text-white/50">Next Up on Campus</span>
        </div>

        <div className="rounded-3xl bg-[#12161f] border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 shadow-2xl group">
          <div className="md:col-span-7 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-[#18202c]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spotlightEvent.posterUrl || RMP_FEATURED_EVENTS[0].posterUrl}
              alt={spotlightEvent.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white font-bold text-xs border border-white/10 shadow-lg">
                {spotlightEvent.category}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>DSA Approved • SRM Ramapuram</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-lime-400 transition-colors">
                {spotlightEvent.title}
              </h3>

              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/40" />
                  <span>
                    {spotlightDateStr} • {spotlightTimeStr} IST
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white/40" />
                  <span>{spotlightEvent.venueName} • SRM Ramapuram</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-white/40 block">Capacity Status</span>
                <span className="text-xs font-bold text-white">
                  {spotlightEvent.capacity - spotlightEvent.registeredCount} spots remaining
                </span>
              </div>

              <Link
                href={`/events/${spotlightEvent.id}`}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-lime-400 text-black font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>RSVP Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LUMA ASCENDING EVENT TIMELINE VIEW
         ========================================================================= */}
      <section className="pt-4">
        <EventTimelineView initialEvents={events} />
      </section>
    </div>
  );
}
