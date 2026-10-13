import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q")?.toLowerCase() || "";

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

    const registrations = await prisma.registration.findMany({
      where: {
        eventId: event.id,
        status: {
          not: RegistrationStatus.CANCELLED,
        },
        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { user: { studentId: { contains: search, mode: "insensitive" } } },
                { ticketToken: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
          },
        },
        checkIn: true,
      },
      orderBy: {
        registeredAt: "asc",
      },
    });

    const attendees = registrations.map((r) => ({
      registrationId: r.id,
      ticketToken: r.ticketToken,
      registeredAt: r.registeredAt,
      status: r.status,
      checkedIn: Boolean(r.checkIn),
      checkedInAt: r.checkIn?.checkedInAt ?? null,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        studentId: r.user.studentId,
        department: r.user.department,
      },
    }));

    return NextResponse.json({
      success: true,
      eventTitle: event.title,
      totalAttendees: attendees.length,
      attendees,
    });
  } catch (error: any) {
    console.error("Failed to load attendees:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load attendees." },
      { status: 500 }
    );
  }
}
