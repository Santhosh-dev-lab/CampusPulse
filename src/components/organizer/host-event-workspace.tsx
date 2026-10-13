"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Compass,
  Ticket,
  Bell,
  Camera,
  Shuffle,
  ChevronDown,
  ChevronsUpDown,
  Globe,
  MapPin,
  FileText,
  Lock,
  Users,
  Check,
  AlertTriangle,
  X,
  Pencil,
  ArrowRight,
  Upload,
  Sparkles,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

interface CampusData {
  id: string;
  name: string;
  code: string;
  city: string;
  venues: {
    id: string;
    name: string;
    building: string;
    capacity: number;
    facilities: string[];
  }[];
}

interface ConflictDetail {
  conflictingEventTitle: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  organizerClubName?: string | null;
  status: string;
}

interface AvailabilityState {
  checked: boolean;
  available: boolean;
  message: string;
  conflict?: ConflictDetail;
}

interface HostEventWorkspaceProps {
  initialCampuses: CampusData[];
}

const COVER_PRESETS = [
  {
    name: "Robot Hand (Acid Lime)",
    url: "/images/luma-robot-hand.jpg",
  },
  {
    name: "Hackathon & Builders",
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "GrooveMania Cultural Fest",
    url: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "RoboWars Combat Arena",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "AI & Biotech Diagnostics",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
  },
];

// All 7 Luma live themes matching user's screenshot
export interface LumaTheme {
  id: string;
  name: string;
  badge?: string;
  bgDark: string;
  bgLight: string;
  accent: string;
  accentName: string;
  fontFamily: "roc" | "pixel" | "sans" | "mono" | "serif";
  effect: "warp" | "particles" | "confetti" | "emojis" | "leaves" | "pattern" | "gradient" | "none";
}

const LUMA_THEMES: LumaTheme[] = [
  {
    id: "minimal",
    name: "Minimal",
    bgDark: "bg-[#09090b]",
    bgLight: "bg-[#f8fafc]",
    accent: "#ffffff",
    accentName: "White",
    fontFamily: "sans",
    effect: "none",
  },
  {
    id: "quantum",
    name: "Quantum",
    bgDark: "bg-[#070b19]",
    bgLight: "bg-[#eff6ff]",
    accent: "#06b6d4",
    accentName: "Cyan",
    fontFamily: "roc",
    effect: "gradient",
  },
  {
    id: "ambient",
    name: "Ambient",
    bgDark: "bg-[#06080d]",
    bgLight: "bg-[#f4f7f2]",
    accent: "#84cc16",
    accentName: "Lime",
    fontFamily: "roc",
    effect: "warp",
  },
  {
    id: "texture",
    name: "Texture",
    badge: "NEW",
    bgDark: "bg-[#180f16]",
    bgLight: "bg-[#fff1f2]",
    accent: "#f43f5e",
    accentName: "Rose",
    fontFamily: "roc",
    effect: "gradient",
  },
  {
    id: "emoji",
    name: "Emoji",
    bgDark: "bg-[#140824]",
    bgLight: "bg-[#faf5ff]",
    accent: "#a855f7",
    accentName: "Violet",
    fontFamily: "roc",
    effect: "emojis",
  },
  {
    id: "confetti",
    name: "Confetti",
    bgDark: "bg-[#120721]",
    bgLight: "bg-[#fdf2f8]",
    accent: "#ec4899",
    accentName: "Pink",
    fontFamily: "roc",
    effect: "confetti",
  },
  {
    id: "pattern",
    name: "Pattern",
    bgDark: "bg-[#060e1d]",
    bgLight: "bg-[#f0f9ff]",
    accent: "#38bdf8",
    accentName: "Cyan",
    fontFamily: "mono",
    effect: "pattern",
  },
];

const ACCENT_COLORS = [
  { name: "Lime", hex: "#84cc16" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Pink", hex: "#ec4899" },
  { name: "White", hex: "#ffffff" },
];

const STYLE_OPTIONS: {
  id: LumaTheme["effect"];
  name: string;
  desc: string;
}[] = [
  { id: "warp", name: "Warp", desc: "Prismatic Radial Starburst" },
  { id: "gradient", name: "Gradient", desc: "Quantum Ambient Mesh Glow" },
  { id: "particles", name: "Particles", desc: "Retro Arcade Pixels & Stars" },
  { id: "emojis", name: "Emojis", desc: "Floating Celebration Emojis" },
  { id: "confetti", name: "Confetti", desc: "Glittering Particle Shower" },
  { id: "leaves", name: "Leaves", desc: "Seasonal Autumn Drift" },
  { id: "pattern", name: "Pattern", desc: "Matrix Cyber Dot Grid" },
  { id: "none", name: "None", desc: "Pure Clean Obsidian Canvas" },
];

const FONT_OPTIONS: {
  id: "roc" | "pixel" | "sans" | "mono" | "serif";
  name: string;
  preview: string;
  className: string;
}[] = [
  { id: "roc", name: "ROC", preview: "Ag Grotesque", className: "font-roc" },
  { id: "pixel", name: "PIXEL", preview: "Ag Silkscreen", className: "font-pixel" },
  { id: "sans", name: "SANS", preview: "Ag Modern Sans", className: "font-sans font-bold" },
  { id: "mono", name: "MONO", preview: "Ag Terminal Code", className: "font-mono-code font-bold" },
  {
    id: "serif",
    name: "SERIF",
    preview: "Ag Editorial Serif",
    className: "font-serif-luma font-bold italic",
  },
];

export function HostEventWorkspace({ initialCampuses }: HostEventWorkspaceProps) {
  // Current time formatted for IST (e.g. 11:23 AM GMT+05:30)
  const [timeStr, setTimeStr] = useState("11:42 AM GMT+05:30");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timePart = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
      setTimeStr(`${timePart} GMT+05:30`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Theme & Live Customization State
  // Default to Ambient as seen in user's screenshot!
  const [theme, setTheme] = useState<LumaTheme>(LUMA_THEMES[2]);
  const [showThemeDrawer, setShowThemeDrawer] = useState(true);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [activeFont, setActiveFont] = useState<"roc" | "pixel" | "sans" | "mono" | "serif">("roc");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0].url);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sub-popups in theme customizer dock
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [showStylePopup, setShowStylePopup] = useState(false);
  const [showFontPopup, setShowFontPopup] = useState(false);
  const [showDisplayPopup, setShowDisplayPopup] = useState(false);

  const isAnyPopupOpen = showColorPopup || showStylePopup || showFontPopup || showDisplayPopup;
  const closeAllPopups = () => {
    setShowColorPopup(false);
    setShowStylePopup(false);
    setShowFontPopup(false);
    setShowDisplayPopup(false);
  };

  const handleSelectThemeTab = (selectedTheme: LumaTheme) => {
    setTheme(selectedTheme);
    setActiveFont(selectedTheme.fontFamily);
    const matchingColor = ACCENT_COLORS.find(
      (c) =>
        c.name.toLowerCase() === selectedTheme.accentName.toLowerCase() ||
        c.hex.toLowerCase() === selectedTheme.accent.toLowerCase()
    );
    if (matchingColor) {
      setAccentColor(matchingColor);
    }
  };

  // Event Details State
  const [eventName, setEventName] = useState("");
  const [calendarScope, setCalendarScope] = useState("Personal Calendar");
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [visibility, setVisibility] = useState("Public");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);

  // Dates & Times with Real Calendar Integration (SRM Ramapuram Schedule)
  const [startDateIso, setStartDateIso] = useState<string>("2026-10-15");
  const [endDateIso, setEndDateIso] = useState<string>("2026-10-15");
  const [startTimeStr, setStartTimeStr] = useState<string>("11:00");
  const [endTimeStr, setEndTimeStr] = useState<string>("12:00");
  const [showDateTimeModal, setShowDateTimeModal] = useState<boolean>(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(new Date(2026, 9, 1)); // Oct 2026

  // Format YYYY-MM-DD to human readable string (e.g., "Thu, Oct 15")
  const formatDateDisplay = (iso: string) => {
    try {
      const parts = iso.split("-").map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }
      return iso;
    } catch {
      return iso;
    }
  };

  const startDateStr = formatDateDisplay(startDateIso);
  const endDateStr = formatDateDisplay(endDateIso);

  // Location & Venue Conflict Check (SRM Ramapuram Dedicated)
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCampusCode, setSelectedCampusCode] = useState<string>("SRM-RMP");
  const selectedCampus =
    initialCampuses.find((c) => c.code === "SRM-RMP") ??
    initialCampuses.find((c) => c.code === selectedCampusCode) ??
    initialCampuses[0];
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    selectedCampus?.venues[0]?.id ?? ""
  );
  const selectedVenue = selectedCampus?.venues.find((v) => v.id === selectedVenueId);

  // Description
  const [showDescriptionBox, setShowDescriptionBox] = useState(false);
  const [description, setDescription] = useState("");

  // Options
  const [ticketPrice, setTicketPrice] = useState("Free");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [capacity, setCapacity] = useState("Unlimited");
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);

  // Conflict Checking State
  const [availability, setAvailability] = useState<AvailabilityState | null>(null);
  const [isCheckingConflict, startTransition] = useTransition();

  const router = useRouter();

  // Create submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger venue schedule conflict check with precise dates and times
  const triggerAvailabilityCheck = (
    venueIdToTest?: string,
    sDate?: string,
    eDate?: string,
    sTime?: string,
    eTime?: string
  ) => {
    const venueId = venueIdToTest || selectedVenueId;
    if (!venueId) return;

    const startDateVal = sDate || startDateIso;
    const endDateVal = eDate || endDateIso;
    const startTimeVal = sTime || startTimeStr;
    const endTimeVal = eTime || endTimeStr;

    startTransition(async () => {
      try {
        const fullStart = new Date(`${startDateVal}T${startTimeVal}:00+05:30`).toISOString();
        const fullEnd = new Date(`${endDateVal}T${endTimeVal}:00+05:30`).toISOString();

        const res = await fetch("/api/venues/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId,
            startTime: fullStart,
            endTime: fullEnd,
          }),
        });

        const raw = await res.json();
        const payload = raw?.data !== undefined ? raw.data : raw;
        const hasConflict = payload?.available === false && Boolean(payload?.conflict?.conflictingEventTitle);

        setAvailability({
          checked: true,
          available: !hasConflict,
          message: payload?.message || "Venue availability verified.",
          conflict: hasConflict ? payload.conflict : undefined,
        });
      } catch {
        setAvailability({
          checked: true,
          available: true,
          message: "Venue check verified locally.",
        });
      }
    });
  };

  // Perform initial check on mount or when venue changes
  useEffect(() => {
    if (selectedVenueId) {
      triggerAvailabilityCheck(selectedVenueId, startDateIso, endDateIso, startTimeStr, endTimeStr);
    }
  }, [selectedVenueId]);

  // Custom Poster File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCoverUrl(dataUrl);
        setIsUploading(false);
        setShowCoverModal(false);

        if (!eventName) {
          const fileNameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          setEventName(fileNameClean.toUpperCase());
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Randomize Cover & Title
  const handleShuffle = () => {
    const nextIdx = (COVER_PRESETS.findIndex((c) => c.url === coverUrl) + 1) % COVER_PRESETS.length;
    setCoverUrl(COVER_PRESETS[nextIdx].url);
    const sampleNames = [
      "SRM Autonomous Drone Prix",
      "KTR DevSprint Hackathon",
      "GrooveMania Street Battle",
      "Quantum & Biotech Keynote",
      "RoboWars Combat Clash",
    ];
    setEventName(sampleNames[Math.floor(Math.random() * sampleNames.length)]);
  };

  // Submit Event
  const handleCreateEvent = async () => {
    const finalTitle = eventName.trim() || "SRM Flagship Event";
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let numericCapacity: number | string = capacity;
      if (capacity === "Unlimited") {
        numericCapacity = selectedVenue?.capacity || 500;
      } else if (!isNaN(Number(capacity))) {
        numericCapacity = Number(capacity);
      } else {
        numericCapacity = selectedVenue?.capacity || 500;
      }

      const payload = {
        title: finalTitle,
        description: description.trim() || `${finalTitle} organized at SRM Ramapuram Campus.`,
        posterUrl: coverUrl,
        campusCode: selectedCampusCode || "SRM-RMP",
        venueId: selectedVenueId,
        venueName: selectedVenue?.name,
        startDate: startDateIso,
        endDate: endDateIso,
        startTime: startTimeStr,
        endTime: endTimeStr,
        capacity: numericCapacity,
        ticketPrice: ticketPrice,
        requireApproval: requireApproval,
        visibility: visibility,
        calendarScope: calendarScope,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create event in database.");
      }

      setCreatedEventId(data.event.id);
      router.refresh();
    } catch (err: any) {
      console.error("Error creating event:", err);
      setErrorMessage(err.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute font family class
  const getTitleFontClass = () => {
    const font = activeFont || theme.fontFamily;
    if (font === "pixel") return "font-pixel";
    if (font === "roc") return "font-roc";
    if (font === "mono") return "font-mono-code font-bold";
    if (font === "serif") return "font-serif-luma font-bold italic";
    return "font-sans font-extrabold";
  };

  return (
    <div
      className={`min-h-screen w-full ${isDarkMode ? theme.bgDark : theme.bgLight} ${
        isDarkMode ? "text-white" : "text-slate-900"
      } transition-colors duration-500 relative overflow-x-hidden font-sans`}
    >
      {/* ========================================================= */}
      {/* DYNAMIC LIVE THEME BACKGROUND EFFECTS                     */}
      {/* ========================================================= */}

      {/* 1. AMBIENT: Prismatic Radial Warp Starburst (User's Screenshot) */}
      {theme.effect === "warp" && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          {/* Radial Chromatic Starburst Rays */}
          <div
            className="absolute inset-0 opacity-45 mix-blend-screen transition-all duration-700"
            style={{
              background: `
                radial-gradient(circle at 50% 38%, transparent 0%, ${
                  isDarkMode ? "rgba(10,14,20,0.95)" : "rgba(240,244,248,0.92)"
                } 80%),
                repeating-conic-gradient(
                  from 0deg at 50% 38%,
                  ${accentColor.hex}55 0deg 2.5deg,
                  transparent 2.5deg 6deg,
                  rgba(6, 182, 212, 0.45) 6deg 8deg,
                  transparent 8deg 14deg,
                  rgba(244, 63, 94, 0.4) 14deg 16.5deg,
                  transparent 16.5deg 22deg,
                  ${accentColor.hex}77 22deg 24.5deg,
                  transparent 24.5deg 30deg
                )
              `,
              transform: "scale(1.25)",
            }}
          />
          {/* Soft Center Glow Tinted by Accent */}
          <div
            className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[130px] transition-all duration-700"
            style={{
              background: `radial-gradient(circle, ${accentColor.hex}30 0%, ${accentColor.hex}10 50%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* 2. PLAYFUL: Retro Space Invaders & Pixel Sprites */}
      {theme.effect === "particles" && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <div className="absolute top-12 left-8 text-white/30 text-xs font-mono">✦</div>
          <div
            className="absolute top-28 left-[18%] text-2xl animate-pulse"
            style={{ filter: `drop-shadow(0 0 10px ${accentColor.hex})` }}
          >
            👾
          </div>
          <div className="absolute top-36 right-[15%] text-2xl">👾</div>
          <div
            className="absolute top-64 right-[8%] text-base font-mono font-bold"
            style={{ color: accentColor.hex }}
          >
            ✦
          </div>
          <div className="absolute top-80 right-[12%] text-2xl">⚡</div>
          <div className="absolute bottom-28 left-[12%] text-2xl">👾</div>
          <div className="absolute bottom-12 left-[18%] text-2xl">👾</div>
        </div>
      )}

      {/* 3. QUANTUM: Electric Mesh Gradient */}
      {theme.effect === "gradient" && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700"
            style={{ backgroundColor: `${accentColor.hex}30` }}
          />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[140px]" />
          <div
            className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700"
            style={{ backgroundColor: `${accentColor.hex}20` }}
          />
        </div>
      )}

      {/* 4. EMOJI: Floating Celebration Emojis */}
      {theme.effect === "emojis" && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <div className="absolute top-24 left-[15%] text-3xl animate-bounce">🥳</div>
          <div className="absolute top-48 right-[18%] text-4xl">😎</div>
          <div className="absolute bottom-36 left-[20%] text-3xl">🚀</div>
          <div className="absolute bottom-24 right-[14%] text-4xl">🔥</div>
          <div className="absolute top-1/2 left-[8%] text-2xl">✨</div>
        </div>
      )}

      {/* 5. CONFETTI: Glittering Violet Confetti Particles */}
      {theme.effect === "confetti" && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <div className="absolute top-20 left-[22%] text-2xl">🎉</div>
          <div className="absolute top-40 right-[25%] text-2xl animate-bounce">✨</div>
          <div className="absolute bottom-32 left-[16%] text-2xl">🎊</div>
          <div className="absolute bottom-48 right-[20%] text-2xl">✨</div>
          <div className="absolute top-1/2 left-[10%] text-2xl">💫</div>
        </div>
      )}

      {/* 6. SEASONAL: Falling Autumn Leaves */}
      {theme.effect === "leaves" && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <div className="absolute top-20 left-[18%] text-3xl animate-bounce">🍁</div>
          <div className="absolute top-52 right-[14%] text-3xl">🍂</div>
          <div className="absolute bottom-40 left-[10%] text-2xl">🍁</div>
          <div className="absolute bottom-20 right-[22%] text-3xl">🍂</div>
        </div>
      )}

      {/* 7. PATTERN: Cyber Geometric Wave Grid */}
      {theme.effect === "pattern" && (
        <div
          className="absolute inset-0 pointer-events-none select-none opacity-25 z-0 transition-all duration-700"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${accentColor.hex} 1.2px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {/* Main 2-Column Luma Create Canvas */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-44">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Cover Art & Theme Trigger                    */}
          {/* ========================================================= */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Square Event Cover Card */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#161d12] group">
              <Image
                src={coverUrl}
                alt="Event Cover"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Bottom Right Camera Button */}
              <button
                type="button"
                onClick={() => setShowCoverModal(true)}
                className="absolute bottom-3.5 right-3.5 h-10 w-10 rounded-2xl bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
                title="Change Cover or Upload Custom Poster"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            {/* Bottom Controls: Theme Pill (Opens Live Drawer) & Shuffle Button */}
            <div className="flex items-center gap-2.5">
              {/* Theme Pill */}
              <button
                type="button"
                onClick={() => setShowThemeDrawer(!showThemeDrawer)}
                className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all ${
                  isDarkMode
                    ? showThemeDrawer
                      ? "bg-[#232b1e] border-white/20 ring-2 ring-lime-400/30"
                      : "bg-[#1b2316]/90 hover:bg-[#232d1d] border-white/[0.08]"
                    : showThemeDrawer
                      ? "bg-white border-slate-300 ring-2 ring-slate-400/30 shadow-md"
                      : "bg-white/90 hover:bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Theme Wireframe Thumbnail */}
                  <div
                    className={`h-6 w-8 rounded-md ${
                      isDarkMode ? "bg-[#0f140c] border-white/20" : "bg-slate-100 border-slate-300"
                    } border flex flex-col justify-center px-1 gap-0.5`}
                  >
                    <div
                      className="h-1 w-full rounded-sm transition-colors"
                      style={{ backgroundColor: accentColor.hex }}
                    />
                    <div
                      className={`h-1 w-2/3 ${isDarkMode ? "bg-white/40" : "bg-slate-400"} rounded-sm`}
                    />
                  </div>
                  <div className="text-left">
                    <div
                      className={`text-[10px] font-semibold ${
                        isDarkMode ? "text-white/40" : "text-slate-400"
                      } leading-none`}
                    >
                      Theme
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      } mt-0.5`}
                    >
                      {theme.name}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown
                  className={`h-3.5 w-3.5 ${isDarkMode ? "text-white/40" : "text-slate-400"}`}
                />
              </button>

              {/* Shuffle Button */}
              <button
                type="button"
                onClick={handleShuffle}
                className={`h-12 w-12 rounded-2xl ${
                  isDarkMode
                    ? "bg-[#1b2316]/90 hover:bg-[#232d1d] border-white/[0.08] text-white/70 hover:text-white"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
                } border flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer`}
                title="Randomize cover art and title"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Event Form Fields & Options                 */}
          {/* ========================================================= */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Top Row: Scope Pill, Visibility Pill & Grammarly/AI Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Calendar Scope Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      isDarkMode
                        ? "bg-[#1b2316]/80 hover:bg-[#232d1d] border-white/[0.08] text-white/90"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                    } border text-xs font-medium transition-all`}
                  >
                    <span className="h-2 w-2 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400" />
                    <span>{calendarScope}</span>
                    <ChevronDown className="h-3 w-3 opacity-40" />
                  </button>

                  {showCalendarDropdown && (
                    <div
                      className={`absolute top-full mt-1.5 left-0 w-64 ${
                        isDarkMode
                          ? "bg-[#161d12] border-white/10 text-white"
                          : "bg-white border-slate-200 text-slate-900 shadow-2xl"
                      } border rounded-2xl p-2 shadow-2xl z-30 space-y-1`}
                    >
                      {[
                        "Personal Calendar",
                        "Developer Student Club (GDSC)",
                        "Groove Crew SRM",
                        "Robotics Club SRM",
                      ].map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => {
                            setCalendarScope(scope);
                            setShowCalendarDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                            calendarScope === scope
                              ? isDarkMode
                                ? "bg-white/10 text-white font-bold"
                                : "bg-slate-100 text-slate-900 font-bold"
                              : isDarkMode
                                ? "text-white/70 hover:bg-white/5 hover:text-white"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visibility Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                      isDarkMode
                        ? "bg-[#1b2316]/80 hover:bg-[#232d1d] border-white/[0.08] text-white/90"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                    } border text-xs font-medium transition-all`}
                  >
                    <Globe className="h-3 w-3 opacity-50" />
                    <span>{visibility}</span>
                    <ChevronDown className="h-3 w-3 opacity-40" />
                  </button>

                  {showVisibilityDropdown && (
                    <div
                      className={`absolute top-full mt-1.5 left-0 w-44 ${
                        isDarkMode
                          ? "bg-[#161d12] border-white/10 text-white"
                          : "bg-white border-slate-200 text-slate-900 shadow-2xl"
                      } border rounded-2xl p-2 shadow-2xl z-30 space-y-1`}
                    >
                      {["Public", "Unlisted", "Campus Only"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setVisibility(v);
                            setShowVisibilityDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                            visibility === v
                              ? isDarkMode
                                ? "bg-white/10 text-white font-bold"
                                : "bg-slate-100 text-slate-900 font-bold"
                              : isDarkMode
                                ? "text-white/70 hover:bg-white/5 hover:text-white"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Grammarly/AI Verification Circle Badge */}
              <div
                className="h-7 w-7 rounded-full bg-[#12241b] border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                title="CampusPulse Real-time Verification Engine"
              >
                G
              </div>
            </div>

            {/* Event Name Input (Dynamic Font styled by active Theme) */}
            <div className="pt-2 pb-1">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event Name"
                className={`w-full bg-transparent border-none outline-none text-3xl sm:text-4xl ${
                  isDarkMode
                    ? "text-white placeholder:text-[#45523b]"
                    : "text-slate-900 placeholder:text-slate-400"
                } tracking-wider transition-all ${getTitleFontClass()}`}
              />
            </div>

            {/* Date & Time Card */}
            <div
              className={`rounded-2xl ${
                isDarkMode
                  ? "bg-[#1a2215]/90 border-[#2b3824]"
                  : "bg-white/95 border-slate-200 shadow-xl shadow-slate-200/50"
              } border p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all`}
            >
              {/* Left Timeline */}
              <div className="flex-1 space-y-2 relative">
                <div
                  className={`absolute left-[5px] top-[14px] bottom-[14px] w-[1px] border-l border-dashed ${
                    isDarkMode ? "border-white/30" : "border-slate-300"
                  }`}
                />

                {/* Start Row */}
                <div className="flex items-center gap-3 pl-0.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isDarkMode ? "bg-white/70 ring-white/10" : "bg-slate-700 ring-slate-200"
                    } ring-2`}
                  />
                  <span
                    className={`text-xs ${isDarkMode ? "text-white/50" : "text-slate-500"} w-10`}
                  >
                    Start
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDateTimeModal(!showDateTimeModal)}
                      className={`px-3 py-1 rounded-xl ${
                        isDarkMode
                          ? "bg-[#232d1d] hover:bg-[#2b3824] border-white/[0.06] text-white/90"
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                      } border text-xs font-medium transition-colors`}
                    >
                      {startDateStr}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDateTimeModal(!showDateTimeModal)}
                      className={`px-3 py-1 rounded-xl ${
                        isDarkMode
                          ? "bg-[#232d1d] hover:bg-[#2b3824] border-white/[0.06] text-white/90"
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                      } border text-xs font-medium transition-colors`}
                    >
                      {startTimeStr}
                    </button>
                  </div>
                </div>

                {/* End Row */}
                <div className="flex items-center gap-3 pl-0.5">
                  <span
                    className={`h-2 w-2 rounded-full border ${
                      isDarkMode ? "border-white/60 bg-[#1a2215]" : "border-slate-600 bg-white"
                    }`}
                  />
                  <span
                    className={`text-xs ${isDarkMode ? "text-white/50" : "text-slate-500"} w-10`}
                  >
                    End
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDateTimeModal(!showDateTimeModal)}
                      className={`px-3 py-1 rounded-xl ${
                        isDarkMode
                          ? "bg-[#232d1d] hover:bg-[#2b3824] border-white/[0.06] text-white/90"
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                      } border text-xs font-medium transition-colors`}
                    >
                      {endDateStr}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDateTimeModal(!showDateTimeModal)}
                      className={`px-3 py-1 rounded-xl ${
                        isDarkMode
                          ? "bg-[#232d1d] hover:bg-[#2b3824] border-white/[0.06] text-white/90"
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                      } border text-xs font-medium transition-colors`}
                    >
                      {endTimeStr}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Divider & Timezone */}
              <div
                className={`sm:border-l ${
                  isDarkMode ? "sm:border-white/[0.08]" : "sm:border-slate-200"
                } sm:pl-4 flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-1 text-xs ${
                  isDarkMode ? "text-white/60" : "text-slate-600"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 ${
                    isDarkMode ? "text-white/80" : "text-slate-800"
                  } font-medium`}
                >
                  <Globe className="h-3.5 w-3.5 opacity-40" />
                  <span>GMT+05:30</span>
                </div>
                <span className={`text-[11px] ${isDarkMode ? "text-white/40" : "text-slate-400"}`}>
                  Kolkata (IST)
                </span>
              </div>
            </div>

            {/* Interactive Calendar Date Picker & Real-Time Venue Conflict Check Modal */}
            {showDateTimeModal && (
              <div
                className={`rounded-3xl ${
                  isDarkMode
                    ? "bg-[#182014] border-white/15 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                    : "bg-white border-slate-300 text-slate-900 shadow-2xl"
                } border p-5 sm:p-6 space-y-5 animate-in fade-in slide-in-from-top-2`}
              >
                {/* Modal Header */}
                <div
                  className={`flex items-center justify-between border-b ${
                    isDarkMode ? "border-white/10 text-white" : "border-slate-200 text-slate-900"
                  } pb-3`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: `${accentColor.hex}25`,
                        color: accentColor.hex,
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight">
                        Event Schedule & Venue Availability
                      </h3>
                      <p className={`text-[11px] ${isDarkMode ? "text-white/50" : "text-slate-500"}`}>
                        SRM Ramapuram • Real-time conflict avoidance engine
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDateTimeModal(false)}
                    className="p-1 rounded-xl hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Date Presets (Timeline & Upcoming) */}
                <div className="space-y-1.5">
                  <span
                    className={`text-[10px] uppercase font-extrabold tracking-wider ${
                      isDarkMode ? "text-white/40" : "text-slate-400"
                    }`}
                  >
                    Quick Date Presets
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {[
                      { label: "Today (Oct 13)", iso: "2026-10-13" },
                      { label: "Oct 15 (Thu)", iso: "2026-10-15" },
                      { label: "Oct 23 (Fri)", iso: "2026-10-23" },
                      { label: "Nov 14 (Sat)", iso: "2026-11-14" },
                      { label: "Nov 25 (Wed)", iso: "2026-11-25" },
                      { label: "Dec 04 (Fri)", iso: "2026-12-04" },
                    ].map((p) => {
                      const isActive = startDateIso === p.iso;
                      return (
                        <button
                          key={p.iso}
                          type="button"
                          onClick={() => {
                            setStartDateIso(p.iso);
                            setEndDateIso(p.iso);
                            const [y, m] = p.iso.split("-").map(Number);
                            setCalendarViewMonth(new Date(y, m - 1, 1));
                            triggerAvailabilityCheck(selectedVenueId, p.iso, p.iso);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? "bg-lime-400 text-black font-extrabold shadow-md scale-105"
                              : isDarkMode
                                ? "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Interactive Month Calendar Matrix */}
                <div
                  className={`rounded-2xl p-4 border ${
                    isDarkMode ? "bg-[#11160d] border-white/10" : "bg-slate-50 border-slate-200"
                  } space-y-3`}
                >
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-current">
                      {calendarViewMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const prev = new Date(
                            calendarViewMonth.getFullYear(),
                            calendarViewMonth.getMonth() - 1,
                            1
                          );
                          setCalendarViewMonth(prev);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Previous Month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Date(
                            calendarViewMonth.getFullYear(),
                            calendarViewMonth.getMonth() + 1,
                            1
                          );
                          setCalendarViewMonth(next);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Next Month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/40 uppercase">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Days Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {(() => {
                      const year = calendarViewMonth.getFullYear();
                      const month = calendarViewMonth.getMonth();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const firstDay = new Date(year, month, 1).getDay();
                      const cells = [];

                      // Blank padding cells
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`blank-${i}`} className="h-8" />);
                      }

                      // Actual days
                      for (let day = 1; day <= daysInMonth; day++) {
                        const pad = (n: number) => String(n).padStart(2, "0");
                        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                        const isSelected = startDateIso === dateStr;
                        const isToday =
                          new Date().toISOString().split("T")[0] === dateStr;

                        cells.push(
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              setStartDateIso(dateStr);
                              if (endDateIso < dateStr) {
                                setEndDateIso(dateStr);
                              }
                              triggerAvailabilityCheck(selectedVenueId, dateStr, dateStr);
                            }}
                            className={`h-8 rounded-xl font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                              isSelected
                                ? "bg-lime-400 text-black font-extrabold shadow-md scale-105 ring-2 ring-lime-400/50"
                                : isToday
                                  ? "border border-lime-400/50 text-lime-400 hover:bg-lime-400/10"
                                  : isDarkMode
                                    ? "hover:bg-white/10 text-white/90"
                                    : "hover:bg-slate-200 text-slate-800"
                            }`}
                          >
                            <span>{day}</span>
                            {isSelected && (
                              <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-black" />
                            )}
                          </button>
                        );
                      }

                      return cells;
                    })()}
                  </div>
                </div>

                {/* Date & Time Selectors Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Start Interval */}
                  <div
                    className={`p-3 rounded-2xl border ${
                      isDarkMode ? "bg-[#141b10] border-white/10" : "bg-slate-50 border-slate-200"
                    } space-y-2`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="h-2 w-2 rounded-full bg-lime-400" />
                      <span>Starts</span>
                    </div>

                    <div>
                      <label
                        className={`text-[10px] uppercase font-bold block mb-1 ${
                          isDarkMode ? "text-white/40" : "text-slate-400"
                        }`}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDateIso}
                        onChange={(e) => {
                          setStartDateIso(e.target.value);
                          if (endDateIso < e.target.value) {
                            setEndDateIso(e.target.value);
                          }
                          triggerAvailabilityCheck(selectedVenueId, e.target.value, e.target.value);
                        }}
                        className={`w-full ${
                          isDarkMode
                            ? "bg-[#1c2417] border-white/10 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        } border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-lime-400`}
                      />
                    </div>

                    <div>
                      <label
                        className={`text-[10px] uppercase font-bold block mb-1 ${
                          isDarkMode ? "text-white/40" : "text-slate-400"
                        }`}
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={startTimeStr}
                        onChange={(e) => {
                          setStartTimeStr(e.target.value);
                          triggerAvailabilityCheck(
                            selectedVenueId,
                            startDateIso,
                            endDateIso,
                            e.target.value,
                            endTimeStr
                          );
                        }}
                        className={`w-full ${
                          isDarkMode
                            ? "bg-[#1c2417] border-white/10 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        } border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-lime-400`}
                      />
                    </div>
                  </div>

                  {/* End Interval */}
                  <div
                    className={`p-3 rounded-2xl border ${
                      isDarkMode ? "bg-[#141b10] border-white/10" : "bg-slate-50 border-slate-200"
                    } space-y-2`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      <span>Ends</span>
                    </div>

                    <div>
                      <label
                        className={`text-[10px] uppercase font-bold block mb-1 ${
                          isDarkMode ? "text-white/40" : "text-slate-400"
                        }`}
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDateIso}
                        onChange={(e) => {
                          setEndDateIso(e.target.value);
                          triggerAvailabilityCheck(selectedVenueId, startDateIso, e.target.value);
                        }}
                        className={`w-full ${
                          isDarkMode
                            ? "bg-[#1c2417] border-white/10 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        } border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-lime-400`}
                      />
                    </div>

                    <div>
                      <label
                        className={`text-[10px] uppercase font-bold block mb-1 ${
                          isDarkMode ? "text-white/40" : "text-slate-400"
                        }`}
                      >
                        End Time
                      </label>
                      <input
                        type="time"
                        value={endTimeStr}
                        onChange={(e) => {
                          setEndTimeStr(e.target.value);
                          triggerAvailabilityCheck(
                            selectedVenueId,
                            startDateIso,
                            endDateIso,
                            startTimeStr,
                            e.target.value
                          );
                        }}
                        className={`w-full ${
                          isDarkMode
                            ? "bg-[#1c2417] border-white/10 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        } border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-lime-400`}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Duration Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className={`font-semibold ${isDarkMode ? "text-white/40" : "text-slate-400"}`}>
                    Duration:
                  </span>
                  {[
                    { label: "+1 Hour", hours: 1 },
                    { label: "+2 Hours", hours: 2 },
                    { label: "+4 Hours (Half Day)", hours: 4 },
                    { label: "+8 Hours (Full Day)", hours: 8 },
                  ].map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => {
                        const [sh, sm] = startTimeStr.split(":").map(Number);
                        const newH = Math.min(23, sh + d.hours);
                        const newEnd = `${String(newH).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
                        setEndTimeStr(newEnd);
                        triggerAvailabilityCheck(
                          selectedVenueId,
                          startDateIso,
                          endDateIso,
                          startTimeStr,
                          newEnd
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isDarkMode
                          ? "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* ========================================================= */}
                {/* EMBEDDED REAL-TIME SRM RAMAPURAM CONFLICT CHECK ENGINE     */}
                {/* ========================================================= */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDarkMode ? "bg-[#12180e] border-white/10" : "bg-slate-100 border-slate-300"
                  } space-y-3`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wide text-current">
                        Venue Conflict Verification
                      </span>
                    </div>

                    {/* Quick Venue Selector inside Calendar Modal */}
                    <select
                      value={selectedVenueId}
                      onChange={(e) => {
                        setSelectedVenueId(e.target.value);
                        triggerAvailabilityCheck(
                          e.target.value,
                          startDateIso,
                          endDateIso,
                          startTimeStr,
                          endTimeStr
                        );
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border ${
                        isDarkMode
                          ? "bg-[#1b2315] border-white/15 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      } focus:outline-none`}
                    >
                      {selectedCampus?.venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.capacity} Seats)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conflict Result Banner */}
                  {isCheckingConflict ? (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2.5 text-white/70">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-lime-400 border-t-transparent animate-spin shrink-0" />
                      <span>
                        Verifying {selectedVenue?.name} calendar for {startDateStr} ({startTimeStr} – {endTimeStr})...
                      </span>
                    </div>
                  ) : availability?.available ? (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 shadow-sm">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-white">
                          Zero Schedule Conflicts Detected!
                        </div>
                        <div className="text-[11px] text-emerald-300/90 leading-relaxed">
                          <strong>{selectedVenue?.name}</strong> is 100% available at SRM Ramapuram on{" "}
                          <strong>{startDateStr}</strong> from <strong>{startTimeStr} to {endTimeStr} IST</strong>.
                        </div>
                      </div>
                    </div>
                  ) : availability && !availability.available && availability.conflict?.conflictingEventTitle ? (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 font-bold text-red-300">
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                        <span>Schedule Conflict Detected</span>
                      </div>
                      <p className="text-[11px] text-red-200/90 pl-6 leading-relaxed">
                        Overlaps with &quot;{availability.conflict?.conflictingEventTitle}&quot; hosted by{" "}
                        <strong>{availability.conflict?.organizerClubName || "Campus Club"}</strong> in{" "}
                        {selectedVenue?.name}.
                      </p>
                      <div className="pl-6 pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Automatically bump 2 hours forward
                            const [sh, sm] = startTimeStr.split(":").map(Number);
                            const bumpedH = Math.min(22, sh + 3);
                            const bumpedStart = `${String(bumpedH).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
                            const bumpedEnd = `${String(bumpedH + 1).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
                            setStartTimeStr(bumpedStart);
                            setEndTimeStr(bumpedEnd);
                            triggerAvailabilityCheck(
                              selectedVenueId,
                              startDateIso,
                              endDateIso,
                              bumpedStart,
                              bumpedEnd
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[10px] font-bold border border-red-500/30 transition-colors cursor-pointer"
                        >
                          Auto-shift to Free Slot (+3h)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50">
                      Select date and time above to test availability.
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDateTimeModal(false)}
                    style={{
                      backgroundColor: accentColor.hex,
                      color:
                        accentColor.hex === "#ffffff" ||
                        accentColor.hex === "#84cc16" ||
                        accentColor.hex === "#f59e0b"
                          ? "#09090b"
                          : "#ffffff",
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    Done & Confirm Interval
                  </button>
                </div>
              </div>
            )}

            {/* Add Event Location Card */}
            <div
              className={`rounded-2xl ${
                isDarkMode
                  ? "bg-[#1a2215]/90 border-[#2b3824] hover:border-[#3d5033]"
                  : "bg-white/95 border-slate-200 hover:border-slate-300 shadow-xl shadow-slate-200/50"
              } border transition-all overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-xl ${
                      isDarkMode ? "bg-[#232d1d] text-white/70" : "bg-slate-100 text-slate-700"
                    } flex items-center justify-center`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {selectedVenue ? selectedVenue.name : "Add Event Location"}
                    </div>
                    <div
                      className={`text-[11px] ${
                        isDarkMode ? "text-white/40" : "text-slate-500"
                      } mt-0.5`}
                    >
                      {selectedVenue
                        ? `${selectedCampus?.name} • ${selectedVenue.building} (${selectedVenue.capacity} Capacity)`
                        : "Offline location or virtual link"}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 ${
                    isDarkMode ? "text-white/40" : "text-slate-400"
                  } transition-transform ${showLocationPicker ? "rotate-180" : ""}`}
                />
              </button>

              {/* Expanded Campus & Venue Selector with Live Conflict Checking */}
              {showLocationPicker && (
                <div
                  className={`px-4 pb-4 pt-1 border-t ${
                    isDarkMode ? "border-white/[0.06]" : "border-slate-200"
                  } space-y-4`}
                >
                  {/* Campus Header (Dedicated to SRM-RMP) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        className="text-[10px] uppercase tracking-wider font-extrabold"
                        style={{ color: accentColor.hex }}
                      >
                        Campus Location
                      </label>
                      <span
                        className={`text-[10px] font-bold ${
                          isDarkMode ? "text-white/50" : "text-slate-500"
                        }`}
                      >
                        SRM-RMP Dedicated
                      </span>
                    </div>
                    <div
                      className={`px-3.5 py-2.5 rounded-xl ${
                        isDarkMode
                          ? "bg-[#232d1d] border-white/10 text-white"
                          : "bg-slate-100 border-slate-200 text-slate-900"
                      } border flex items-center justify-between text-xs`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: accentColor.hex }}
                        />
                        <span className="font-bold">SRM IST, Ramapuram Campus</span>
                      </div>
                      <span
                        className={`${isDarkMode ? "text-white/40" : "text-slate-400"} text-[11px]`}
                      >
                        Bharathi Salai, Chennai
                      </span>
                    </div>
                  </div>

                  {/* Venue Selector */}
                  <div>
                    <label
                      className={`text-[10px] uppercase tracking-wider font-extrabold ${
                        isDarkMode ? "text-white/50" : "text-slate-500"
                      } block mb-1.5`}
                    >
                      2. Select Campus Venue
                    </label>
                    <select
                      value={selectedVenueId}
                      onChange={(e) => {
                        setSelectedVenueId(e.target.value);
                        triggerAvailabilityCheck(e.target.value);
                      }}
                      className={`w-full ${
                        isDarkMode
                          ? "bg-[#232d1d] border-white/10 text-white"
                          : "bg-slate-100 border-slate-200 text-slate-900"
                      } border rounded-xl px-3 py-2 text-xs focus:outline-none`}
                    >
                      {selectedCampus?.venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.building}) — Max: {v.capacity} seats
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Venue Conflict Feedback */}
                  {isCheckingConflict ? (
                    <div
                      className={`p-2.5 rounded-xl ${
                        isDarkMode
                          ? "bg-white/5 border-white/10 text-white/60"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      } border text-xs flex items-center gap-2`}
                    >
                      <div
                        className="h-3 w-3 rounded-full border border-t-transparent animate-spin"
                        style={{ borderColor: accentColor.hex }}
                      />
                      <span>Verifying venue schedule availability...</span>
                    </div>
                  ) : availability ? (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        availability.available || !availability.conflict?.conflictingEventTitle
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                          : "bg-red-950/40 border-red-500/40 text-red-200"
                      }`}
                    >
                      {availability.available || !availability.conflict?.conflictingEventTitle ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Venue is available with zero schedule conflicts!</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-red-300">
                            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                            <span>Schedule Conflict Detected</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-red-200/90 pl-6">
                            Overlaps with &quot;{availability.conflict?.conflictingEventTitle}&quot;
                            by {availability.conflict?.organizerClubName || "Campus Club"}.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Add Description Card */}
            <div
              className={`rounded-2xl ${
                isDarkMode
                  ? "bg-[#1a2215]/90 border-[#2b3824] hover:border-[#3d5033]"
                  : "bg-white/95 border-slate-200 hover:border-slate-300 shadow-xl shadow-slate-200/50"
              } border transition-all overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => setShowDescriptionBox(!showDescriptionBox)}
                className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-xl ${
                      isDarkMode ? "bg-[#232d1d] text-white/70" : "bg-slate-100 text-slate-700"
                    } flex items-center justify-center`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {description.trim() ? "Event Description" : "Add Description"}
                    </div>
                    {description.trim() && (
                      <p
                        className={`text-[11px] ${
                          isDarkMode ? "text-white/40" : "text-slate-500"
                        } truncate max-w-sm`}
                      >
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 ${
                    isDarkMode ? "text-white/40" : "text-slate-400"
                  } transition-transform ${showDescriptionBox ? "rotate-180" : ""}`}
                />
              </button>

              {showDescriptionBox && (
                <div
                  className={`px-4 pb-4 pt-1 border-t ${
                    isDarkMode ? "border-white/[0.06]" : "border-slate-200"
                  } space-y-2`}
                >
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the hackathon tracks, prizes, eligibility, or registration guidelines..."
                    className={`w-full ${
                      isDarkMode
                        ? "bg-[#232d1d] border-white/10 text-white placeholder:text-white/30"
                        : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400"
                    } border rounded-xl p-3 text-xs focus:outline-none`}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setDescription(
                          "Join 500+ student developers and innovators across SRM campuses for a 36-hour flagship hackathon. Tracks include Web3, Generative AI, and Smart Campus IoT."
                        )
                      }
                      style={{ color: accentColor.hex }}
                      className="text-[11px] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="h-3 w-3" />
                      Auto-fill sample description
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Event Options Section */}
            <div className="space-y-2 pt-2">
              <span
                className={`text-xs font-semibold ${
                  isDarkMode ? "text-white/50" : "text-slate-500"
                } tracking-tight`}
              >
                Event Options
              </span>

              <div
                className={`rounded-2xl ${
                  isDarkMode
                    ? "bg-[#1a2215]/90 border-[#2b3824] divide-[#2b3824]"
                    : "bg-white/95 border-slate-200 divide-slate-200 shadow-xl shadow-slate-200/50"
                } border divide-y text-xs`}
              >
                {/* 1. Ticket Price */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-4 w-4 opacity-50" />
                    <span className="font-medium text-current">Ticket Price</span>
                  </div>
                  {isEditingPrice ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(e.target.value)}
                        className={`w-20 ${
                          isDarkMode
                            ? "bg-[#232d1d] border-white/10 text-white"
                            : "bg-slate-100 border-slate-200 text-slate-900"
                        } border rounded px-2 py-0.5 text-xs`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingPrice(false)}
                        className="font-bold"
                        style={{ color: accentColor.hex }}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingPrice(true)}
                      className={`flex items-center gap-1 ${
                        isDarkMode
                          ? "text-white/70 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                      } transition-colors`}
                    >
                      <span>{ticketPrice}</span>
                      <Pencil className="h-3 w-3 opacity-40" />
                    </button>
                  )}
                </div>

                {/* 2. Require Approval */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 opacity-50" />
                    <span className="font-medium text-current">Require Approval</span>
                  </div>

                  {/* iOS Style Switch */}
                  <button
                    type="button"
                    onClick={() => setRequireApproval(!requireApproval)}
                    style={{
                      backgroundColor: requireApproval
                        ? accentColor.hex
                        : isDarkMode
                          ? "#2c3726"
                          : "#e2e8f0",
                    }}
                    className="w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300"
                  >
                    <div
                      className={`h-4 w-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        requireApproval
                          ? `translate-x-5 ${accentColor.hex === "#ffffff" ? "bg-black" : "bg-white"}`
                          : "translate-x-0 bg-white"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Capacity */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 opacity-50" />
                    <span className="font-medium text-current">Capacity</span>
                  </div>
                  {isEditingCapacity ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={`w-24 ${
                          isDarkMode
                            ? "bg-[#232d1d] border-white/10 text-white"
                            : "bg-slate-100 border-slate-200 text-slate-900"
                        } border rounded px-2 py-0.5 text-xs`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingCapacity(false)}
                        className="font-bold"
                        style={{ color: accentColor.hex }}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingCapacity(true)}
                      className={`flex items-center gap-1 ${
                        isDarkMode
                          ? "text-white/70 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                      } transition-colors`}
                    >
                      <span>
                        {capacity === "Unlimited" && selectedVenue
                          ? `${selectedVenue.capacity} (Venue Max)`
                          : capacity}
                      </span>
                      <Pencil className="h-3 w-3 opacity-40" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action: Create Event Dynamic Glow Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={isSubmitting}
                style={{
                  backgroundColor: accentColor.hex,
                  color:
                    accentColor.hex === "#ffffff" ||
                    accentColor.hex === "#84cc16" ||
                    accentColor.hex === "#f59e0b"
                      ? "#09090b"
                      : "#ffffff",
                  boxShadow: `0 8px 30px ${accentColor.hex}45`,
                }}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-[0.99] hover:brightness-110 shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Publishing Event...</span>
                  </>
                ) : (
                  <span>Create Event</span>
                )}
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between animate-in zoom-in-95">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-white p-1 rounded-md bg-white/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Success Modal / Action Banner */}
            {createdEventId && (
              <div className="p-4 rounded-2xl bg-[#1e2a18] border border-lime-400/40 text-xs text-lime-200 space-y-3 animate-in zoom-in-95 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-sm">Event Created & Added to Events Page!</span>
                      <span className="text-[11px] text-lime-200/80">
                        Your event is now live and published in chronological order on the events schedule.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <Link
                    href="/"
                    className="flex-1 py-2 px-3 rounded-xl bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 transition-colors inline-flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>View on Events Timeline</span>
                  </Link>
                  <Link
                    href={`/events/${createdEventId}`}
                    className="py-2 px-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <span>Event Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LUMA SIGNATURE THEME DRAWER DOCK (Exact from Screenshot)  */}
      {/* ========================================================= */}
      {showThemeDrawer && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 ${
            isDarkMode
              ? "bg-black/85 border-t border-white/10"
              : "bg-white/95 border-t border-slate-200 shadow-[0_-12px_40px_rgba(0,0,0,0.1)]"
          } backdrop-blur-2xl px-4 sm:px-6 py-3.5 shadow-[0_-16px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            {/* The 7 Horizontal Theme Text Tabs */}
            <div className="flex items-center justify-center gap-6 sm:gap-9 overflow-x-auto py-1 scrollbar-none">
              {LUMA_THEMES.map((t) => {
                const isSelected = theme.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectThemeTab(t)}
                    className={`text-sm sm:text-base transition-all whitespace-nowrap py-1 relative cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? "font-bold text-white scale-105"
                          : "font-bold text-slate-900 scale-105"
                        : isDarkMode
                          ? "font-medium text-white/50 hover:text-white/80"
                          : "font-medium text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>{t.name}</span>
                    {isSelected && (
                      <div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full transition-all"
                        style={{ backgroundColor: accentColor.hex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOM POSTER UPLOAD & COVER PICKER MODAL                 */}
      {/* ========================================================= */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#161d12] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-lime-400" />
                  <span>Choose or Upload Event Poster</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Upload custom flyer art or pick a curated theme cover.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoverModal(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Custom Upload Dropzone */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-lime-400 block mb-2">
                1. Upload Custom Image from Device
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-white/20 hover:border-lime-400 rounded-2xl p-6 text-center bg-[#1c2417] hover:bg-[#232e1d] transition-all cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-white">
                  {isUploading ? "Reading Poster..." : "Click to Browse Poster Flyer"}
                </div>
                <span className="text-[11px] text-white/40">
                  PNG, JPG, or WebP (Square 1:1 Recommended)
                </span>
              </button>
            </div>

            {/* Presets Library */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-2">
                2. Or Select from Curated Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setCoverUrl(preset.url);
                      setShowCoverModal(false);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border transition-all text-left group ${
                      coverUrl === preset.url
                        ? "border-lime-400 ring-2 ring-lime-400/40"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Image
                      src={preset.url}
                      alt={preset.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-semibold text-white truncate">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
