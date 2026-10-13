import { NextRequest, NextResponse } from "next/server";
import { checkVenueAvailability } from "@/server/services/venue.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const startTimeStr = searchParams.get("startTime");
    const endTimeStr = searchParams.get("endTime");
    const excludeEventId = searchParams.get("excludeEventId") || undefined;

    if (!venueId || !startTimeStr || !endTimeStr) {
      return NextResponse.json(
        {
          available: false,
          error: "Missing required query parameters: venueId, startTime, and endTime are required.",
        },
        { status: 400 }
      );
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { available: false, error: "Invalid date format. Expected ISO 8601 strings." },
        { status: 400 }
      );
    }

    const result = await checkVenueAvailability({
      venueId,
      startTime,
      endTime,
      excludeEventId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Venue availability check error:", error);
    return NextResponse.json(
      { available: false, error: error?.message || "Failed to check availability." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venueId, startTime: startTimeStr, endTime: endTimeStr, excludeEventId } = body;

    if (!venueId || !startTimeStr || !endTimeStr) {
      return NextResponse.json(
        {
          available: false,
          error: "Missing required body fields: venueId, startTime, and endTime.",
        },
        { status: 400 }
      );
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { available: false, error: "Invalid date format." },
        { status: 400 }
      );
    }

    const result = await checkVenueAvailability({
      venueId,
      startTime,
      endTime,
      excludeEventId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Venue availability check error:", error);
    return NextResponse.json(
      { available: false, error: error?.message || "Failed to check availability." },
      { status: 500 }
    );
  }
}
