import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Sparkles,
  Ticket,
} from "lucide-react";

// Fallback demo events when testing via sample IDs
const DEMO_EVENT_DETAILS: Record<
  string,
  {
    title: string;
    category: string;
    club: string;
    posterUrl: string;
    venueName: string;
    building: string;
    campusCode: string;
    month: string;
    day: string;
    fullDate: string;
    timeSlot: string;
    capacity: number;
    registered: number;
    description: string;
  }
> = {
  "evt-hack-srm": {
    title: "HackSRM 2026: 36-Hour National Flagship Hackathon",
    category: "Hackathon",
    club: "Developer Student Club SRM (GDSC)",
    posterUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Tech Park Mini Auditorium",
    building: "4th Floor, Tech Park Complex",
    campusCode: "SRM-KTR",
    month: "OCT",
    day: "24",
    fullDate: "Saturday, October 24, 2026",
    timeSlot: "9:00 AM – Oct 25, 9:00 PM IST (36 Hours)",
    capacity: 350,
    registered: 312,
    description:
      "Join 500+ student builders across India to build decentralized, AI, and smart campus prototypes. Mentorship from industry leaders, cash prizes, free food, and overnight hacking in the SRM Tech Park.",
  },
  "evt-groove-mania": {
    title: "GrooveMania 2026: Intra-College Dance Showcase & Street Battle",
    category: "Cultural Fest",
    club: "Groove Crew SRM",
    posterUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
    venueName: "Dr. T. P. Ganesan Auditorium (Main Hall)",
    building: "TP Ganesan Auditorium Complex",
    campusCode: "SRM-KTR",
    month: "OCT",
    day: "19",
    fullDate: "Monday, October 19, 2026",
    timeSlot: "5:00 PM – 9:00 PM IST",
    capacity: 2500,
    registered: 1840,
    description:
      "Experience electrifying dance performances, street face-offs, and live DJ sets by Groove Crew SRM at the Grand TP Ganesan Auditorium.",
  },
  "evt-ai-biotech": {
    title: "AI in Clinical Diagnostics & Genomics: Keynote Lecture",
    category: "Guest Lecture",
    club: "Bioengineering Research Society",
    posterUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Biotech Seminar Hall",
    building: "1st Floor, Bio-Tech Block",
    campusCode: "SRM-KTR",
    month: "OCT",
    day: "20",
    fullDate: "Tuesday, October 20, 2026",
    timeSlot: "2:00 PM – 4:00 PM IST",
    capacity: 150,
    registered: 142,
    description:
      "Explore deep learning approaches to early genomic cancer detection and high-throughput cellular screening with Dr. Swaminathan.",
  },
  "evt-robowars": {
    title: "RoboWars 2026: High-Octane Combat Bot Arena Clash",
    category: "Technical",
    club: "Robotics Club SRM",
    posterUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    venueName: "Java Green Open Amphitheatre",
    building: "Java Block Courtyard",
    campusCode: "SRM-KTR",
    month: "OCT",
    day: "29",
    fullDate: "Thursday, October 29, 2026",
    timeSlot: "10:00 AM – 4:00 PM IST",
    capacity: 800,
    registered: 420,
    description:
      "Combative robotics tournament in the open amphitheatre featuring 15kg and 30kg combat bots clashing inside bulletproof polycarbonate arenas.",
  },
};

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try fetching from database first
  let dbEvent = null;
  try {
    dbEvent = await prisma.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        venue: true,
        campus: true,
        organizerClub: true,
      },
    });
  } catch (err) {
    console.warn("Could not query event by ID:", id, err);
  }

  // Use DB data if found, otherwise use fallback demo data
  const fallback = DEMO_EVENT_DETAILS[id] || DEMO_EVENT_DETAILS["evt-hack-srm"];

  const title = dbEvent?.title || fallback.title;
  const category = dbEvent?.category || fallback.category;
  const club = dbEvent?.organizerClub?.name || fallback.club;
  const posterUrl = dbEvent?.posterUrl || fallback.posterUrl;
  const venueName = dbEvent?.venue?.name || fallback.venueName;
  const building = dbEvent?.venue?.building || fallback.building;
  const campusCode = dbEvent?.campus?.code || fallback.campusCode;
  const capacity = dbEvent?.capacity || fallback.capacity;
  const registered = dbEvent?.registeredCount || fallback.registered;
  const description = dbEvent?.description || fallback.description;

  const dateObj = dbEvent ? new Date(dbEvent.startTime) : new Date("2026-10-24T09:00:00");
  const month = dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const day = dateObj.toLocaleDateString("en-IN", { day: "numeric" });
  const fullDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeSlot = `${dateObj.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} IST`;

  const spotsLeft = Math.max(0, capacity - registered);
  const percentFilled = Math.min(100, Math.round((registered / capacity) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to SRM Events</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold bg-white shadow-sm transition-all"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Event</span>
        </button>
      </div>

      {/* Main 2-Column Luma Event Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Poster Cover + Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cover Poster with Rounded Corners */}
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-950/80 backdrop-blur-md text-white shadow-sm">
                {category}
              </span>
            </div>
          </div>

          {/* Title & Host Header */}
          <div className="space-y-3 pt-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>

            {/* Host Row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
                SRM
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{club}</span>
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Official Recognized Campus Organization
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Description Body */}
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-normal">
            <h2 className="text-base font-bold text-slate-900">About this Event</h2>
            <p>{description}</p>
            <p>
              Open to all SRM Institute of Science and Technology students across Kattankulathur,
              Ramapuram, and Vadapalani campuses.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Eligibility & Rules</span>
              </div>
              <p>
                Valid SRM ID card required at entrance check-in. Registrations are tracked by
                student roll number to guarantee one pass per attendee.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Sticky Luma RSVP Box */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="luma-card rounded-3xl p-6 sm:p-7 space-y-6 border border-slate-200 shadow-lg">
            {/* Date & Time Mini Card */}
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-900 shrink-0">
                <span className="text-[9px] font-black uppercase text-indigo-600 leading-none">
                  {month}
                </span>
                <span className="text-sm font-black leading-tight">{day}</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{fullDate}</p>
                <p className="text-[11px] text-slate-500">{timeSlot}</p>
                <span className="text-[11px] font-semibold text-indigo-600 inline-block pt-0.5">
                  Synced with SRM Academic Calendar
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Location / Venue Card */}
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <MapPin className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{venueName}</p>
                <p className="text-[11px] text-slate-500">{building}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                  {campusCode}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Capacity Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Admission</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Free Student Pass
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{registered} registered</span>
                <span className="font-semibold text-slate-700">{spotsLeft} spots remaining</span>
              </div>
            </div>

            {/* Frictionless One-Click RSVP Button */}
            <div className="space-y-2 pt-2">
              <Link
                href="/my-tickets"
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="h-4 w-4" />
                <span>Claim Pass & View QR Ticket</span>
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Verified with Santhosh Kumar (RA2311003010512)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
