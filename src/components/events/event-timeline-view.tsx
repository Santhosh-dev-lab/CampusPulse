"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Filter,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

export interface TimelineEventItem {
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

interface EventTimelineViewProps {
  initialEvents: TimelineEventItem[];
}

const CATEGORIES = [
  "All Events",
  "Hackathons",
  "Technical",
  "Cultural",
  "Guest Lectures",
  "Workshops",
];

const RMP_VENUES = [
  "All Venues",
  "TRP Auditorium",
  "Gallery Hall 1",
  "Gallery Hall 2",
  "Gallery Hall 3",
  "Gallery Hall 4",
  "MLCP Labs (1–7)",
];

export function EventTimelineView({ initialEvents }: EventTimelineViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [selectedVenue, setSelectedVenue] = useState("All Venues");

  // Filter events based on search, category, and venue
  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((evt) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = evt.title.toLowerCase().includes(q);
          const matchesVenue = evt.venueName.toLowerCase().includes(q);
          const matchesClub = evt.organizerClubName.toLowerCase().includes(q);
          const matchesCat = evt.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesVenue && !matchesClub && !matchesCat) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "All Events") {
          const catNorm = selectedCategory.toLowerCase().replace(/s$/, "");
          const evtCatNorm = evt.category.toLowerCase();
          if (!evtCatNorm.includes(catNorm)) {
            return false;
          }
        }

        // Venue filter
        if (selectedVenue !== "All Venues") {
          if (selectedVenue === "MLCP Labs (1–7)") {
            if (!evt.venueName.toLowerCase().includes("mlcp")) return false;
          } else if (!evt.venueName.toLowerCase().includes(selectedVenue.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [initialEvents, searchQuery, selectedCategory, selectedVenue]);

  // Group events by local date key in strictly ASCENDING order (soonest coming event at top)
  const groupedEvents = useMemo(() => {
    const groups: {
      dateKey: string;
      datePrimary: string; // e.g. "Oct 15"
      dayOfWeek: string; // e.g. "Thursday"
      events: TimelineEventItem[];
    }[] = [];

    const map = new Map<string, TimelineEventItem[]>();

    filteredEvents.forEach((evt) => {
      const d = new Date(evt.startTime);
      // Key format YYYY-MM-DD in Indian Standard Time (IST)
      const dateKey = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(evt);
    });

    // Sort date keys in strict ASCENDING order
    const sortedDateKeys = Array.from(map.keys()).sort();

    sortedDateKeys.forEach((key) => {
      const evts = map.get(key)!;
      const d = new Date(evts[0].startTime);

      const datePrimary = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      }); // e.g. "Oct 15"

      const dayOfWeek = d.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
      }); // e.g. "Thursday"

      groups.push({
        dateKey: key,
        datePrimary,
        dayOfWeek,
        events: evts.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      });
    });

    return groups;
  }, [filteredEvents]);

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* SEARCH & INTERACTIVE FILTER BAR                                           */}
      {/* ========================================================================= */}
      <div className="space-y-4 rounded-3xl bg-[#0b0e17] border border-white/10 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ramapuram events, venues, clubs, or speakers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121622] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          {/* Ramapuram Venue Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {RMP_VENUES.map((venue) => {
              const isActive = selectedVenue === venue;
              return (
                <button
                  key={venue}
                  type="button"
                  onClick={() => setSelectedVenue(venue)}
                  className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-bold shadow-md"
                      : "bg-[#121622] text-white/70 hover:text-white hover:bg-[#1a202e] border border-white/[0.08]"
                  }`}
                >
                  {venue}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-white/[0.06] pt-3">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-lime-400 text-black shadow-md font-extrabold"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Section Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-5 w-5 text-lime-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Upcoming Event Timeline
            </h2>
            <p className="text-xs text-white/40 font-medium">
              Chronological schedule for SRM Ramapuram • Ascending order
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
            {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} Scheduled
          </span>
        </div>
      </div>

      {/* Empty State */}
      {groupedEvents.length === 0 && (
        <div className="rounded-3xl bg-[#0e111a] border border-white/10 p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-white/5 text-white/40 flex items-center justify-center mx-auto">
            <Filter className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Upcoming Events Found</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
              No events matched your current search filters. Try resetting the venue or category.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Events");
              setSelectedVenue("All Venues");
            }}
            className="px-4 py-2 rounded-xl bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXACT LUMA TIMELINE TRACK LAYOUT (MATCHING SCREENSHOT)                    */}
      {/* ========================================================================= */}
      <div className="space-y-0 relative">
        {groupedEvents.map((group, groupIdx) => {
          const isLastGroup = groupIdx === groupedEvents.length - 1;

          return (
            <div
              key={group.dateKey}
              className="relative flex flex-col md:flex-row items-stretch gap-4 md:gap-8 pb-12 last:pb-4 group"
            >
              {/* ========================================================= */}
              {/* LEFT TIMELINE DATE & NODE TRACK                           */}
              {/* ========================================================= */}
              <div className="flex items-start justify-between md:justify-start w-full md:w-56 shrink-0">
                {/* Date Header: Exactly matching screenshot */}
                <div className="space-y-0.5 text-left flex-1 md:flex-initial md:w-36">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {group.datePrimary}
                  </div>
                  <div className="text-sm sm:text-base font-normal text-zinc-400 capitalize">
                    {group.dayOfWeek}
                  </div>
                </div>

                {/* Vertical Dashed Track with Circular Node Marker */}
                <div className="relative flex flex-col items-center self-stretch w-8 shrink-0">
                  {/* Node Dot (centered beside the date header) */}
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-400 ring-4 ring-[#07090e] shadow-sm z-10 shrink-0 mt-2.5 transition-all duration-300 group-hover:scale-125 group-hover:bg-lime-400" />

                  {/* Vertical Dashed Line running down to connect seamlessly */}
                  {!isLastGroup && (
                    <div className="w-[1px] flex-1 border-r border-dashed border-zinc-600/70 my-1" />
                  )}
                  {isLastGroup && (
                    <div className="w-[1px] h-14 border-r border-dashed border-zinc-600/30 my-1" />
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT EVENT CARDS COLUMN (Events for this date)           */}
              {/* ========================================================= */}
              <div className="flex-1 w-full space-y-4 pt-0.5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.events.map((evt) => {
                    const dateObj = new Date(evt.startTime);
                    const timeStr = dateObj.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Kolkata",
                    });

                    const spotsLeft = Math.max(0, evt.capacity - evt.registeredCount);

                    return (
                      <Link
                        key={evt.id}
                        href={`/events/${evt.id}`}
                        className="group/card flex flex-col justify-between rounded-3xl bg-[#11151f] hover:bg-[#161c29] border border-white/10 hover:border-lime-400/40 p-4 sm:p-5 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <div className="space-y-4">
                          {/* Image & Badges */}
                          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#18202c]">
                            {evt.posterUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={evt.posterUrl}
                                alt={evt.title}
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#161d28] to-[#1e2738] text-white/40">
                                <span className="font-mono text-xs uppercase tracking-wider">
                                  SRM Ramapuram
                                </span>
                              </div>
                            )}

                            {/* Category Badge */}
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-black/80 backdrop-blur-md text-white border border-white/15 shadow-sm">
                                {evt.category}
                              </span>
                            </div>

                            {/* Time Badge */}
                            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md text-white border border-white/15 shadow-sm flex items-center gap-1.5 text-[11px] font-semibold">
                              <Clock className="h-3 w-3 text-lime-400" />
                              <span>{timeStr} IST</span>
                            </div>

                            {/* Verified Badge */}
                            <div className="absolute top-2.5 right-2.5">
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-lime-400/90 text-black shadow-sm">
                                SRM-RMP
                              </span>
                            </div>
                          </div>

                          {/* Event Title & Venue */}
                          <div className="space-y-2">
                            <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover/card:text-lime-300 transition-colors line-clamp-2">
                              {evt.title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-xs text-white/60">
                              <MapPin className="h-3.5 w-3.5 text-lime-400/80 shrink-0" />
                              <span className="truncate font-medium">
                                {evt.venueName} • SRM Ramapuram
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer: Organizer Club & Action */}
                        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-white/70 truncate max-w-[55%]">
                            <ShieldCheck className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                            <span className="truncate text-[11px] font-medium">
                              {evt.organizerClubName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-lime-300">
                              {spotsLeft} spots left
                            </span>
                            <div className="h-6 w-6 rounded-full bg-white/10 group-hover/card:bg-lime-400 group-hover/card:text-black flex items-center justify-center text-white transition-colors">
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
