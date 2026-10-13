import React from "react";
import Link from "next/link";
import { EventCard } from "@/components/shared/event-card";
import {
  Search,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const FEATURED_EVENTS = [
  {
    id: "evt-hack-srm",
    title: "HackSRM 2026: 36-Hour National Flagship Hackathon",
    slug: "hacksrm-2026",
    category: "Hackathon",
    posterUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Tech Park Mini Auditorium (4th Floor)",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 9 * 3600 * 1000).toISOString(),
    capacity: 350,
    registeredCount: 312,
    organizerClubName: "Developer Student Club SRM (GDSC)",
  },
  {
    id: "evt-groove-mania",
    title: "GrooveMania 2026: Intra-College Dance Showcase & Street Battle",
    slug: "groovemania-2026",
    category: "Cultural Fest",
    posterUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
    venueName: "Dr. T. P. Ganesan Auditorium (Main Hall)",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 17 * 3600 * 1000).toISOString(),
    capacity: 2500,
    registeredCount: 1840,
    organizerClubName: "Groove Crew SRM",
  },
  {
    id: "evt-ai-biotech",
    title: "AI in Clinical Diagnostics & Genomics: Keynote Lecture",
    slug: "ai-clinical-diagnostics-2026",
    category: "Guest Lecture",
    posterUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Biotech Seminar Hall (1st Floor)",
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 14 * 3600 * 1000).toISOString(),
    capacity: 150,
    registeredCount: 142,
    organizerClubName: "Bioengineering Research Society",
  },
  {
    id: "evt-robowars",
    title: "RoboWars 2026: High-Octane Combat Bot Arena Clash",
    slug: "robowars-2026",
    category: "Technical",
    posterUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    venueName: "Java Green Open Amphitheatre",
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000).toISOString(),
    capacity: 800,
    registeredCount: 420,
    organizerClubName: "Robotics Club SRM",
  },
];

const CATEGORIES = [
  "All Events",
  "Hackathons",
  "Technical",
  "Cultural",
  "Keynotes",
  "Workshops",
  "Sports",
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* =========================================================================
          LUMA SIGNATURE SPOTLIGHT HERO
         ========================================================================= */}
      <section className="relative rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 z-10" />
        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-20 p-8 sm:p-12 lg:p-16 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Discover SRM University Events</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Delightful events, hosted on campus.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
            CampusPulse brings Luma-style effortless event discovery and ticketing to SRM
            University. RSVP with your student ID, receive instant cryptographic QR passes, and
            enjoy conflict-free campus life.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#explore-feed"
              className="px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <span>Explore Events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create an Event</span>
            </Link>
          </div>
        </div>

        {/* Live Campus Pulse Strip */}
        <div className="relative z-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Campus Status:</span>
            <span className="font-semibold text-white">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">4 Flagship Events</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">2,714 RSVPs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Verified DSA Approvals</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LUMA DISCOVERY CONTROLS: CAMPUS TABS & SMART SEARCH
         ========================================================================= */}
      <section id="explore-feed" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          {/* Campus Filter Segmented Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 overflow-x-auto scrollbar-none">
            <button className="px-4 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm whitespace-nowrap">
              All Campuses
            </button>
            <button className="px-4 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors whitespace-nowrap">
              Kattankulathur (Main)
            </button>
            <button className="px-4 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors whitespace-nowrap">
              Ramapuram
            </button>
            <button className="px-4 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors whitespace-nowrap">
              Vadapalani
            </button>
          </div>

          {/* Search Box with Shortcut Badge */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, clubs, venues..."
              className="w-full pl-9 pr-12 py-2 text-xs rounded-full bg-white border border-slate-200/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </span>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                idx === 0
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* =========================================================================
            LUMA EVENT CARDS GRID
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {FEATURED_EVENTS.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          LUMA FEATURE CALLOUT: FAST HOSTING & CHECK-IN
         ========================================================================= */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-base font-bold text-slate-900">Frictionless RSVP</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            One-click student registration. Never retype your credentials. Receive cryptographically
            signed QR tickets instantly.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-base font-bold text-slate-900">Conflict-Free Venues</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Real-time interval overlap detection guarantees auditoriums and grounds never get
            double-booked across SRM campuses.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900">AI Poster to Event Draft</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload your club poster image. Extract dates, venues, and descriptions into a published
            event page in seconds.
          </p>
        </div>
      </section>
    </div>
  );
}
