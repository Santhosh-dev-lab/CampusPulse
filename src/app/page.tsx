import React from "react";
import Link from "next/link";
import { EventCard } from "@/components/shared/event-card";
import {
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  Building2,
  Users2,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

// Initial showcase events matching the database seed
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
    organizerClubName: "Developer Student Club (GDSC SRM)",
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
    title: "RoboWars 2026: High-Octane Combat Bot Clash",
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
  "All Categories",
  "Hackathon",
  "Cultural Fest",
  "Guest Lecture",
  "Technical",
  "Workshop",
  "Sports",
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white p-8 sm:p-12 lg:p-16 border border-indigo-900/40 shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Smart Campus Discovery for SRM University</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover what’s happening across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              SRM Campus.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            The unified platform connecting students with club fests, technical hackathons, guest
            keynotes, and cultural showcases. Register with one click, get verified QR passes, and
            never miss an event.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#explore-events"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              Explore All Events
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold backdrop-blur-md border border-white/10 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Host an Event
            </Link>
          </div>
        </div>

        {/* Live Campus Stats Bar */}
        <div className="relative z-10 mt-10 pt-8 border-t border-indigo-800/40 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
              <CalendarDays className="h-3.5 w-3.5" />
              Active Events
            </div>
            <p className="text-2xl font-black text-white">24+</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
              <Users2 className="h-3.5 w-3.5" />
              Students Registered
            </div>
            <p className="text-2xl font-black text-white">4,820</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
              <Building2 className="h-3.5 w-3.5" />
              Campuses
            </div>
            <p className="text-2xl font-black text-white">3 (KTR, RMP, VDP)</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Verified
            </div>
            <p className="text-2xl font-black text-emerald-400">100%</p>
          </div>
        </div>
      </section>

      {/* Discovery, Search & Category Filters */}
      <section id="explore-events" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upcoming Events</h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing approved events scheduled across Kattankulathur venues.
            </p>
          </div>

          {/* Search Bar & Campus Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, clubs, venues..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="shrink-0">
              <select className="px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="SRM-KTR">SRM Kattankulathur</option>
                <option value="SRM-RMP">SRM Ramapuram</option>
                <option value="SRM-VDP">SRM Vadapalani</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                idx === 0
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {FEATURED_EVENTS.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </section>
    </div>
  );
}
