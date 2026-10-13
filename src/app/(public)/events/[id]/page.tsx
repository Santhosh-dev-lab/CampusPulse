import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EventRsvpCard } from "@/components/events/event-rsvp-card";
import {
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Sparkles,
  Ticket,
  Calendar,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";

// Fallback demo events dedicated exclusively to SRM-RMP (Ramapuram Campus)
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
  "evt-ai-biotech": {
    title: "AI in Clinical Diagnostics: Keynote Lecture & Live Demo",
    category: "Guest Lecture",
    club: "Bioengineering Research Society RMP",
    posterUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    venueName: "Gallery Hall 1",
    building: "3rd Floor, BMS Block, SRM Ramapuram",
    campusCode: "SRM-RMP",
    month: "OCT",
    day: "15",
    fullDate: "Thursday, October 15, 2026",
    timeSlot: "9:30 AM – 12:30 PM IST",
    capacity: 300,
    registered: 140,
    description:
      "Explore deep learning approaches to early genomic cancer detection and high-throughput cellular screening with Dr. Swaminathan in Gallery Hall 1 at SRM Ramapuram.",
  },
  "evt-hack-srm": {
    title: "HackSRM RMP 2026: 36-Hour National Flagship Hackathon",
    category: "Hackathon",
    club: "GDSC SRM Ramapuram",
    posterUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    venueName: "TRP Auditorium (Main Stage)",
    building: "TRP Complex, SRM Ramapuram Campus",
    campusCode: "SRM-RMP",
    month: "OCT",
    day: "23",
    fullDate: "Friday, October 23, 2026",
    timeSlot: "10:00 AM – Oct 24, 10:00 PM IST (36 Hours)",
    capacity: 1200,
    registered: 840,
    description:
      "Join 500+ student builders across India to build decentralized, AI, and smart campus prototypes. Mentorship from industry leaders, cash prizes, free food, and overnight hacking in the TRP Auditorium at SRM Ramapuram.",
  },
  "evt-groove-mania": {
    title: "GrooveMania 2026: Ramapuram Intra-College Dance Showcase",
    category: "Cultural Fest",
    club: "Groove Crew RMP",
    posterUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
    venueName: "TRP Auditorium",
    building: "TRP Complex, SRM Ramapuram Campus",
    campusCode: "SRM-RMP",
    month: "NOV",
    day: "14",
    fullDate: "Saturday, November 14, 2026",
    timeSlot: "5:00 PM – 9:00 PM IST",
    capacity: 1200,
    registered: 950,
    description:
      "Experience electrifying dance performances, street face-offs, and live DJ sets by Groove Crew RMP at the Grand TRP Auditorium in SRM Ramapuram.",
  },
  "evt-robowars": {
    title: "RoboWars 2026: Combat Bot Arena Clash at Ramapuram",
    category: "Technical",
    club: "Robotics Club SRM RMP",
    posterUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    venueName: "Gallery Hall 3",
    building: "BMS Block, SRM Ramapuram",
    campusCode: "SRM-RMP",
    month: "NOV",
    day: "25",
    fullDate: "Wednesday, November 25, 2026",
    timeSlot: "11:00 AM – 4:00 PM IST",
    capacity: 200,
    registered: 185,
    description:
      "Combative robotics tournament featuring 15kg and 30kg combat bots clashing inside bulletproof polycarbonate arenas at Gallery Hall 3, SRM Ramapuram.",
  },
  "evt-cloud-k8s": {
    title: "Cloud Native & Kubernetes Hands-On Masterclass",
    category: "Workshops",
    club: "Cloud Computing Cell RMP",
    posterUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    venueName: "MLCP Lab 3",
    building: "MLCP Block, SRM Ramapuram",
    campusCode: "SRM-RMP",
    month: "DEC",
    day: "04",
    fullDate: "Friday, December 4, 2026",
    timeSlot: "2:00 PM – 5:00 PM IST",
    capacity: 120,
    registered: 92,
    description:
      "Practical hands-on lab containerizing microservices, setting up Helm charts, and deploying on multi-node Kubernetes clusters in MLCP Lab 3.",
  },
};

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Query event from PostgreSQL
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

    if (!dbEvent) {
      const cleanId = id.replace(/^(evt-|cp-)/i, "");
      dbEvent = await prisma.event.findFirst({
        where: {
          OR: [
            { slug: { contains: cleanId, mode: "insensitive" } },
            { title: { contains: cleanId.replace(/-/g, " "), mode: "insensitive" } },
          ],
        },
        include: {
          venue: true,
          campus: true,
          organizerClub: true,
        },
      });
    }
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
    <div className="max-w-6xl mx-auto space-y-8 text-white">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Ramapuram Events</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-white/70 hover:text-white text-xs font-semibold bg-white/5 hover:bg-white/10 shadow-sm transition-all"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Main 2-Column Luma Event Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Poster Cover + Full Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cover Poster with Rounded Corners & Glow */}
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-[#161d28] border border-white/10 shadow-2xl group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
                {category}
              </span>
            </div>
            <div className="absolute bottom-4 right-4">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-lime-400 text-black shadow-lg">
                SRM-RMP Verified
              </span>
            </div>
          </div>

          {/* Title & Host Header */}
          <div className="space-y-3 pt-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {title}
            </h1>

            {/* Host Row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-8 w-8 rounded-full bg-lime-400/20 border border-lime-400/40 flex items-center justify-center font-bold text-xs text-lime-300">
                RMP
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{club}</span>
                  <ShieldCheck className="h-4 w-4 text-lime-400" />
                </div>
                <p className="text-[11px] text-white/50">
                  Official Recognized Organization • SRM Ramapuram Campus
                </p>
              </div>
            </div>
          </div>

          <hr className="border-white/[0.08]" />

          {/* Date & Time Metadata Card */}
          <div className="rounded-2xl bg-[#12161f] border border-white/10 p-5 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-[#1c2330] border border-white/10 flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-[9px] font-black text-lime-400 uppercase leading-none">
                  {month}
                </span>
                <span className="text-sm font-black text-white leading-tight">{day}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{fullDate}</h4>
                <p className="text-xs text-white/50 mt-0.5">{timeSlot}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-2 border-t border-white/[0.06]">
              <div className="h-10 w-10 rounded-2xl bg-[#1c2330] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                <MapPin className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{venueName}</h4>
                <p className="text-xs text-white/50 mt-0.5">{building}</p>
                <span className="inline-block text-[10px] font-bold text-lime-400 mt-1">
                  SRM IST Ramapuram, Bharathi Salai, Chennai
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-2xl bg-[#12161f] border border-white/10 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              About This Event
            </h3>
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line">
              {description}
            </p>

            <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-bold">
                  Eligibility
                </span>
                <span className="text-white font-semibold">All SRM Ramapuram Students</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-bold">
                  Entry Pass
                </span>
                <span className="text-white font-semibold">Digital QR / ID Card Verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Sticky Luma RSVP Ticket Card */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <EventRsvpCard
            eventId={dbEvent?.id || id}
            initialCapacity={capacity}
            initialRegistered={registered}
            venueName={venueName}
          />
        </div>
      </div>
    </div>
  );
}
