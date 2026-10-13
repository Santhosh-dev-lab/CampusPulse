import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import { performCheckIn } from "@/server/services/checkin.service";
import { AppError } from "@/lib/errors/app-error";

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
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const checkIns = await prisma.checkIn.findMany({
      where: {
        registration: {
          eventId: event.id,
        },
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                studentId: true,
              },
            },
          },
        },
        checkedInBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkedInAt: "desc",
      },
    });

    const formatted = checkIns.map((ci) => ({
      id: ci.id,
      ticketToken: ci.registration.ticketToken,
      attendeeName: ci.registration.user.name,
      studentId: ci.registration.user.studentId,
      attendeeEmail: ci.registration.user.email,
      checkedInAt: ci.checkedInAt,
      checkInMethod: ci.checkInMethod,
      checkedInBy: ci.checkedInBy.name || ci.checkedInBy.email,
    }));

    return NextResponse.json({
      success: true,
      eventTitle: event.title,
      totalCheckedIn: formatted.length,
      checkIns: formatted,
    });
  } catch (error: any) {
    console.error("Failed to load check-ins:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load check-ins." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const staffUser = await getCurrentUser(request);
    const body = await request.json();

    const { ticketToken, checkInMethod = "QR_SCAN", notes } = body;

    if (!ticketToken) {
      return NextResponse.json(
        { success: false, error: "Ticket token is required" },
        { status: 400 }
      );
    }

    const result = await performCheckIn({
      ticketToken,
      staffUserId: staffUser.id,
      checkInMethod,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Checked in: ${result.attendeeName || "Attendee"}`,
      ...result,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error?.message || "Check-in failed" },
      { status: 500 }
    );
  }
}
