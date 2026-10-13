import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react";

export interface EventCardProps {
  id: string;
  title: string;
  slug: string;
  category: string;
  posterUrl?: string | null;
  venueName?: string | null;
  startTime: string;
  capacity: number;
  registeredCount: number;
  organizerClubName?: string | null;
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
  organizerClubName,
}: EventCardProps) {
  const dateObj = new Date(startTime);
  const month = dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const day = dateObj.toLocaleDateString("en-IN", { day: "numeric" });
  const time = dateObj.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const spotsLeft = Math.max(0, capacity - registeredCount);
  const isFull = spotsLeft === 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      {/* Event Image Banner */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-400">
            <Calendar className="h-12 w-12 stroke-[1.5]" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/60 backdrop-blur-md text-white">
            {category}
          </span>
        </div>

        {/* Date Stamp Widget */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2 text-center shadow-sm min-w-12 border border-slate-200/60">
          <span className="block text-[10px] font-bold tracking-wider text-indigo-600">
            {month}
          </span>
          <span className="block text-base font-extrabold text-slate-900 leading-tight">{day}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {organizerClubName && (
            <p className="text-xs font-semibold text-indigo-600 mb-1 tracking-wide uppercase">
              {organizerClubName}
            </p>
          )}

          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h3>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{time} IST</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{venueName || "Venue TBA"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {isFull ? (
                  <span className="text-rose-600 font-semibold">Housefull ({capacity} filled)</span>
                ) : (
                  <span>
                    {spotsLeft} spots left of {capacity}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Free Pass
          </span>

          <Link
            href={`/events/${id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors"
          >
            Register Pass
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
