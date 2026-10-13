import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import { RegistrationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const registrations = await prisma.registration.findMany({
      where: {
        userId: user.id,
        status: {
          not: RegistrationStatus.CANCELLED,
        },
      },
      include: {
        event: {
          include: {
            venue: true,
            campus: true,
            organizerClub: true,
          },
        },
        checkIn: true,
      },
      orderBy: {
        event: {
          startTime: "asc",
        },
      },
    });

    const tickets = registrations.map((reg) => {
      const e = reg.event;
      const startTime = new Date(e.startTime);
      const dateFormatted = startTime.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeFormatted = `${startTime.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} IST`;

      return {
        id: reg.id,
        eventId: e.id,
        eventTitle: e.title,
        eventSlug: e.slug,
        posterUrl: e.posterUrl,
        category: e.category,
        status: reg.status,
        ticketToken: reg.ticketToken,
        venue: e.venue?.name || "Campus Venue",
        building: e.venue?.building || "SRM Campus",
        campus: e.campus.name,
        campusCode: e.campus.code,
        date: dateFormatted,
        time: timeFormatted,
        rawStartTime: e.startTime,
        attendee: user.name || "Student Attendee",
        studentId: (user as any).studentId || "RA2311003010512",
        email: user.email,
        seatType: "Official Student Pass",
        checkedInAt: reg.checkIn
          ? new Date(reg.checkIn.checkedInAt).toLocaleString("en-IN")
          : null,
        checkInMethod: reg.checkIn?.checkInMethod ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tickets,
    });
  } catch (error: any) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch user tickets." },
      { status: 500 }
    );
  }
}
