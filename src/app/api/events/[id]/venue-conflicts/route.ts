import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkVenueAvailability } from "@/server/services/venue.service";

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
      select: {
        id: true,
        title: true,
        venueId: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.venueId) {
      return NextResponse.json({
        success: true,
        available: true,
        message: "No venue assigned to this event.",
      });
    }

    const result = await checkVenueAvailability({
      venueId: event.venueId,
      startTime: event.startTime,
      endTime: event.endTime,
      excludeEventId: event.id,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Venue conflicts check error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check venue conflicts." },
      { status: 500 }
    );
  }
}
