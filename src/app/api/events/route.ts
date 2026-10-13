import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { EventStatus, UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusCode = searchParams.get("campus") || "SRM-RMP";

    const events = await prisma.event.findMany({
      where: {
        campus: {
          code: campusCode,
        },
      },
      include: {
        venue: true,
        campus: true,
        organizerClub: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category: rawCategory,
      posterUrl,
      campusCode = "SRM-RMP",
      venueId,
      venueName,
      startDate,
      endDate,
      startTime,
      endTime,
      capacity: rawCapacity,
      ticketPrice = "Free",
      requireApproval = false,
      visibility = "Public",
      calendarScope,
    } = body;

    const eventTitle = (title && typeof title === "string" && title.trim())
      ? title.trim()
      : "SRM Flagship Event";

    // Auto-infer category if not provided
    let category = "Technical";
    if (rawCategory && typeof rawCategory === "string" && rawCategory.trim()) {
      category = rawCategory.trim();
    } else {
      const lower = eventTitle.toLowerCase();
      if (lower.includes("hack") || lower.includes("sprint") || lower.includes("dev")) {
        category = "Hackathon";
      } else if (lower.includes("dance") || lower.includes("cultural") || lower.includes("music") || lower.includes("fest")) {
        category = "Cultural Fest";
      } else if (lower.includes("keynote") || lower.includes("lecture") || lower.includes("talk") || lower.includes("ai in")) {
        category = "Guest Lecture";
      } else if (lower.includes("robot") || lower.includes("bot") || lower.includes("arena")) {
        category = "Technical";
      } else if (lower.includes("workshop") || lower.includes("masterclass") || lower.includes("hands-on")) {
        category = "Workshops";
      }
    }

    // 1. Resolve Campus
    let campus = await prisma.campus.findUnique({
      where: { code: campusCode },
    });
    if (!campus) {
      campus = await prisma.campus.findFirst({
        where: { code: "SRM-RMP" },
      });
    }
    if (!campus) {
      campus = await prisma.campus.findFirst();
    }
    if (!campus) {
      campus = await prisma.campus.create({
        data: {
          name: "SRM IST, Ramapuram Campus",
          code: "SRM-RMP",
          city: "Ramapuram, Chennai",
          state: "Tamil Nadu",
          country: "India",
        },
      });
    }

    // 2. Resolve Venue
    let venue = null;
    if (venueId) {
      venue = await prisma.venue.findUnique({
        where: { id: venueId },
      });
    }
    // If venueId is a fallback id or was not found directly, lookup by venue name or code
    if (!venue && (venueName || venueId)) {
      const searchTerms = [venueName, venueId].filter(Boolean) as string[];
      for (const term of searchTerms) {
        // Handle fallback ids like 'ven-rmp-trp', 'ven-rmp-gal-1', etc.
        let friendlyName = term;
        if (term.includes("trp")) friendlyName = "TRP Auditorium";
        else if (term.includes("gal-1") || term.toLowerCase() === "gallery hall 1") friendlyName = "Gallery Hall 1";
        else if (term.includes("gal-2") || term.toLowerCase() === "gallery hall 2") friendlyName = "Gallery Hall 2";
        else if (term.includes("gal-3") || term.toLowerCase() === "gallery hall 3") friendlyName = "Gallery Hall 3";
        else if (term.includes("gal-4") || term.toLowerCase() === "gallery hall 4") friendlyName = "Gallery Hall 4";
        else if (/mlcp.*1/i.test(term)) friendlyName = "MLCP Lab 1";
        else if (/mlcp.*2/i.test(term)) friendlyName = "MLCP Lab 2";
        else if (/mlcp.*3/i.test(term)) friendlyName = "MLCP Lab 3";
        else if (/mlcp.*4/i.test(term)) friendlyName = "MLCP Lab 4";
        else if (/mlcp.*5/i.test(term)) friendlyName = "MLCP Lab 5";
        else if (/mlcp.*6/i.test(term)) friendlyName = "MLCP Lab 6";
        else if (/mlcp.*7/i.test(term)) friendlyName = "MLCP Lab 7";

        venue = await prisma.venue.findFirst({
          where: {
            campusId: campus.id,
            OR: [
              { name: { contains: friendlyName, mode: "insensitive" } },
              { name: { contains: term, mode: "insensitive" } },
            ],
          },
        });
        if (venue) break;
      }
    }
    // Fallback to first venue in campus if still not found
    if (!venue) {
      venue = await prisma.venue.findFirst({
        where: { campusId: campus.id },
      });
    }

    // 3. Resolve User (Organizer / Creator)
    let user = await prisma.user.findFirst({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.ORGANIZER] },
      },
    });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "organizer.rmp@srmist.edu.in",
          name: "SRM Ramapuram Events Lead",
          role: UserRole.ORGANIZER,
          campusId: campus.id,
        },
      });
    }

    // 4. Resolve Club (Organizer Club)
    let club = await prisma.club.findFirst({
      where: { campusId: campus.id },
    });
    if (!club) {
      const clubName = calendarScope && !calendarScope.includes("Personal")
        ? calendarScope
        : "GDSC SRM Ramapuram";
      const clubSlug = clubName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      club = await prisma.club.create({
        data: {
          name: clubName,
          slug: `${clubSlug}-${Date.now().toString(36)}`,
          description: "Google Developer Student Clubs & Student Technical Community, SRM Ramapuram",
          category: "Technical",
          campusId: campus.id,
          memberships: {
            create: {
              userId: user.id,
              role: "PRESIDENT",
            },
          },
        },
      });
    }

    // 5. Compute Dates
    let startDateTime: Date;
    let endDateTime: Date;

    if (startTime && startTime.includes("T")) {
      startDateTime = new Date(startTime);
    } else if (startDate && startTime) {
      startDateTime = new Date(`${startDate}T${startTime}:00+05:30`);
    } else {
      startDateTime = new Date("2026-10-24T11:00:00+05:30");
    }

    if (endTime && endTime.includes("T")) {
      endDateTime = new Date(endTime);
    } else if (endDate && endTime) {
      endDateTime = new Date(`${endDate}T${endTime}:00+05:30`);
    } else {
      endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
    }

    // Guard: invalid date check
    if (isNaN(startDateTime.getTime())) {
      startDateTime = new Date("2026-10-24T11:00:00+05:30");
    }
    if (isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) {
      endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
    }

    // 6. Capacity
    let numericCapacity = venue?.capacity || 300;
    if (rawCapacity && typeof rawCapacity === "number" && rawCapacity > 0) {
      numericCapacity = rawCapacity;
    } else if (typeof rawCapacity === "string" && !isNaN(Number(rawCapacity)) && Number(rawCapacity) > 0) {
      numericCapacity = Number(rawCapacity);
    }

    // 7. Unique Slug
    const baseSlug = eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${baseSlug || "srm-event"}-${Date.now().toString(36)}`;

    // 8. Description
    const finalDescription = (description && typeof description === "string" && description.trim())
      ? description.trim()
      : `${eventTitle} organized at ${venue?.name || "SRM Ramapuram Campus"}. Connect with fellow students, innovators, and mentors.`;

    // 9. Create Event in Database
    const newEvent = await prisma.event.create({
      data: {
        title: eventTitle,
        slug,
        description: finalDescription,
        category,
        posterUrl: posterUrl || "/images/luma-robot-hand.jpg",
        status: EventStatus.PUBLISHED,
        startTime: startDateTime,
        endTime: endDateTime,
        capacity: numericCapacity,
        isPublic: visibility !== "Unlisted",
        requiresApproval: Boolean(requireApproval),
        campusId: campus.id,
        venueId: venue?.id || null,
        organizerClubId: club?.id || null,
        createdById: user.id,
      },
      include: {
        venue: true,
        campus: true,
        organizerClub: true,
      },
    });

    // Invalidate cached pages so the new event appears instantly
    try {
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath(`/events/${newEvent.id}`);
      revalidatePath(`/events/${newEvent.slug}`);
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: "Event published successfully!",
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create event in database.",
      },
      { status: 500 }
    );
  }
}
