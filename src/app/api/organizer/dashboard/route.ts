import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // If student, still allow previewing demo or filter events
    const isAdmin = user.role === UserRole.ADMIN;

    // Fetch organizer's events (or all events if admin)
    const events = await prisma.event.findMany({
      where: isAdmin
        ? {}
        : {
            OR: [
              { createdById: user.id },
              { organizerClub: { memberships: { some: { userId: user.id } } } },
            ],
          },
      include: {
        venue: true,
        campus: true,
        organizerClub: true,
        registrations: {
          include: {
            checkIn: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    let totalCapacity = 0;
    let totalRegistrations = 0;
    let totalCheckedIn = 0;

    const eventSummaries = events.map((ev) => {
      totalCapacity += ev.capacity;
      const regCount = ev.registrations.length;
      totalRegistrations += regCount;
      const checkedIn = ev.registrations.filter((r) => Boolean(r.checkIn)).length;
      totalCheckedIn += checkedIn;

      const rate = regCount > 0 ? Math.round((checkedIn / regCount) * 100) : 0;

      return {
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        status: ev.status,
        category: ev.category,
        startTime: ev.startTime,
        venueName: ev.venue?.name || "Campus Venue",
        capacity: ev.capacity,
        registeredCount: regCount,
        checkedInCount: checkedIn,
        attendanceRate: rate,
        posterUrl: ev.posterUrl,
      };
    });

    const overallAttendanceRate =
      totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents: events.length,
        totalCapacity,
        totalRegistrations,
        totalCheckedIn,
        attendanceRate: overallAttendanceRate,
      },
      events: eventSummaries,
    });
  } catch (error: any) {
    console.error("Organizer dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load organizer dashboard." },
      { status: 500 }
    );
  }
}
