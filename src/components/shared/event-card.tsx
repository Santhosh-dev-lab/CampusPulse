import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, ShieldCheck, Clock, Users } from "lucide-react";

export interface EventCardProps {
  id: string;
  title: string;
  slug?: string;
  category: string;
  posterUrl?: string | null;
  venueName?: string | null;
  startTime: string;
  capacity: number;
  registeredCount: number;
  organizerClubName?: string | null;
  campusName?: string;
}

export function EventCard({
  id,
  title,
  slug: _slug,
  category,
  posterUrl,
  venueName,
  startTime,
  capacity,
  registeredCount,
  organizerClubName = "SRM Ramapuram Club",
}: EventCardProps) {
  const dateObj = new Date(startTime);
  const weekday = dateObj.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
  const month = dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const day = dateObj.toLocaleDateString("en-IN", { day: "numeric" });
  const time = dateObj.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const spotsLeft = Math.max(0, capacity - registeredCount);
  const isFull = spotsLeft === 0;

  // Avatar initials for club
  const clubInitials = (organizerClubName || "SRM Ramapuram Club")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-[#12161f]/90 hover:bg-[#171d29] border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl group">
      <div>
        {/* Poster Image Container */}
        <Link
          href={`/events/${id}`}
          className="block relative aspect-[16/10] w-full overflow-hidden bg-[#18202c]"
        >
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#161d28] to-[#1e2738] text-white/40">
              <span className="font-mono text-xs uppercase tracking-wider">No Cover</span>
            </div>
          )}

          {/* Category Tag (Luma Frosted Glass Pill) */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-black/75 backdrop-blur-md text-white border border-white/10 shadow-sm">
              {category}
            </span>
          </div>

          {/* Quick Date Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md text-white border border-white/15 shadow-sm text-center min-w-10">
            <span className="block text-[9px] font-extrabold text-lime-400 tracking-wider uppercase leading-none">
              {month}
            </span>
            <span className="block text-sm font-black leading-tight">{day}</span>
          </div>
        </Link>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Host Byline (Avatar + Club Name + Verified Badge) */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-[9px] font-extrabold text-lime-300 shrink-0">
              {clubInitials}
            </div>
            <span className="text-xs font-semibold text-white/70 truncate">
              {organizerClubName}
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-lime-400 shrink-0" />
          </div>

          {/* Event Title */}
          <Link href={`/events/${id}`} className="block group/title">
            <h3 className="font-bold text-base text-white group-hover/title:text-lime-400 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Time & Venue Metadata */}
          <div className="space-y-1.5 pt-1 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-white/40 shrink-0" />
              <span>
                {weekday}, {time} IST
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
              <span className="truncate">{venueName || "TRP Auditorium"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Capacity & RSVP Button */}
      <div className="p-5 pt-0 border-t border-white/[0.06] mt-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-white/50 font-medium">
          <Users className="h-3.5 w-3.5 text-white/40" />
          {isFull ? (
            <span className="text-red-400 font-semibold">Housefull</span>
          ) : (
            <span>{spotsLeft} spots left</span>
          )}
        </div>

        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-lime-400 text-black font-bold text-xs transition-colors shadow-sm"
        >
          <span>RSVP</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
