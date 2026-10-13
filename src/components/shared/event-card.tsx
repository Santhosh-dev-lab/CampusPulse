import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, ShieldCheck, Clock } from "lucide-react";

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
  organizerClubName = "SRM Student Club",
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
  const clubInitials = (organizerClubName || "SRM Student Club")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="luma-card rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Poster Image Container */}
        <Link
          href={`/events/${id}`}
          className="block relative aspect-[16/10] w-full overflow-hidden bg-slate-100"
        >
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50 text-indigo-400">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                No Cover
              </span>
            </div>
          )}

          {/* Category Tag (Luma Frosted Glass Pill) */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-900/75 backdrop-blur-md text-white shadow-sm">
              {category}
            </span>
          </div>

          {/* Quick Date Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200/60 shadow-sm text-center min-w-10">
            <span className="block text-[9px] font-extrabold text-indigo-600 tracking-wider uppercase leading-none">
              {month}
            </span>
            <span className="block text-sm font-black leading-tight">{day}</span>
          </div>
        </Link>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Host Byline (Avatar + Club Name + Verified Badge) */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-indigo-100 border border-indigo-200/80 flex items-center justify-center text-[9px] font-extrabold text-indigo-700 shrink-0">
              {clubInitials}
            </div>
            <span className="text-xs font-semibold text-slate-600 truncate">
              {organizerClubName}
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          </div>

          {/* Event Title */}
          <Link href={`/events/${id}`} className="block">
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Date, Time & Venue Specs */}
          <div className="space-y-1.5 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {weekday}, {month} {day} • {time} IST
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{venueName || "Venue TBA"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar: Attendee Counter & Luma Registration Pill */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Attendees Stack */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex -space-x-1.5 overflow-hidden">
            <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 text-[8px] font-bold flex items-center justify-center text-slate-700">
              SK
            </div>
            <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-indigo-100 text-[8px] font-bold flex items-center justify-center text-indigo-700">
              AI
            </div>
            <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-100 text-[8px] font-bold flex items-center justify-center text-emerald-700">
              RS
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {isFull ? (
              <span className="text-rose-600 font-semibold">Housefull</span>
            ) : (
              <span>{spotsLeft} spots left</span>
            )}
          </span>
        </div>

        {/* Action Button */}
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <span>RSVP</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
