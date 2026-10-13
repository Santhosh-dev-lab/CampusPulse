import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        venue: true,
        campus: true,
        organizerClub: true,
        registrations: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                studentId: true,
                department: true,
              },
            },
            checkIn: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const totalRegistered = event.registrations.length;
    const checkedInRegistrations = event.registrations.filter((r) => Boolean(r.checkIn));
    const totalCheckedIn = checkedInRegistrations.length;
    const spotsLeft = Math.max(0, event.capacity - totalRegistered);
    const attendanceRate =
      totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

    // Build timeline buckets for check-ins (e.g. grouped by 30-min intervals)
    const checkInTimes = checkedInRegistrations
      .map((r) => r.checkIn!.checkedInAt)
      .sort((a, b) => a.getTime() - b.getTime());

    return NextResponse.json({
      success: true,
      analytics: {
        eventId: event.id,
        title: event.title,
        status: event.status,
        capacity: event.capacity,
        registeredCount: totalRegistered,
        spotsRemaining: spotsLeft,
        checkedInCount: totalCheckedIn,
        attendanceRate,
        venue: {
          name: event.venue?.name,
          building: event.venue?.building,
          capacity: event.venue?.capacity,
        },
        campus: event.campus.code,
        checkInTimes: checkInTimes.map((t) => t.toISOString()),
      },
    });
  } catch (error: any) {
    console.error("Event analytics error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load event analytics." },
      { status: 500 }
    );
  }
}
