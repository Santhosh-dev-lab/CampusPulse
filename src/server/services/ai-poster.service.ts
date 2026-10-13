import { z } from "zod";

export const ExtractedEventDraftSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  category: z.string().default("Workshop"),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  venueName: z.string().optional(),
  organizerName: z.string().optional(),
  estimatedCapacity: z.number().int().positive().optional(),
  confidenceScore: z.number().min(0).max(1).default(0.85),
  missingFields: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  requiresHumanReview: z.literal(true).default(true),
});

export type ExtractedEventDraft = z.infer<typeof ExtractedEventDraftSchema>;

export interface PosterExtractionProvider {
  extractFromPoster(imageBuffer: Buffer, mimeType: string): Promise<ExtractedEventDraft>;
}

/**
 * Deterministic Mock Provider for offline and local development.
 * Never requires third-party API keys to build or run.
 */
export class MockPosterExtractionProvider implements PosterExtractionProvider {
  public async extractFromPoster(_imageBuffer: Buffer): Promise<ExtractedEventDraft> {
    const defaultStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const defaultEnd = new Date(defaultStart.getTime() + 4 * 60 * 60 * 1000);

    return {
      title: "SRM TechXelerate 2026",
      description:
        "Annual university technical symposium featuring AI hackathons, paper presentations, and robotics tracks.",
      category: "Technical",
      startTime: defaultStart.toISOString(),
      endTime: defaultEnd.toISOString(),
      venueName: "TP Ganesan Auditorium",
      organizerName: "Developer Student Club SRM",
      estimatedCapacity: 350,
      confidenceScore: 0.92,
      missingFields: ["Ticket Pricing", "Chief Guest Details"],
      warnings: [
        "Extracted start time is tentative. Please confirm exact dates before submitting for admin approval.",
        "AI extracted draft requires human organizer confirmation prior to submission.",
      ],
      requiresHumanReview: true,
    };
  }
}

/**
 * Factory for poster extraction provider
 */
export function getPosterExtractionProvider(): PosterExtractionProvider {
  const provider = process.env.AI_PROVIDER || "mock";

  if (provider === "mock") {
    return new MockPosterExtractionProvider();
  }

  // Future providers (Gemini Vision, OpenAI GPT-4o) can be added here
  console.info(
    `AI provider "${provider}" requested. Falling back to deterministic mock if unconfigured.`
  );
  return new MockPosterExtractionProvider();
}
