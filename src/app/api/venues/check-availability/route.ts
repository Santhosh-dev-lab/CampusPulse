import { NextRequest } from "next/server";
import { z } from "zod";
import { checkVenueAvailability } from "@/server/services/venue.service";
import { jsonResponse, handleApiError } from "@/lib/errors/app-error";

const checkAvailabilitySchema = z.object({
  venueId: z.string().min(1, "venueId is required"),
  startTime: z.string().datetime({ message: "startTime must be an ISO datetime string" }),
  endTime: z.string().datetime({ message: "endTime must be an ISO datetime string" }),
  excludeEventId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkAvailabilitySchema.parse(body);

    const result = await checkVenueAvailability({
      venueId: validated.venueId,
      startTime: new Date(validated.startTime),
      endTime: new Date(validated.endTime),
      excludeEventId: validated.excludeEventId,
    });

    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
