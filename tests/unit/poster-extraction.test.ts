import { describe, it, expect } from "vitest";
import { getPosterExtractionProvider } from "@/server/services/ai-poster.service";

describe("AI Poster Extraction Provider", () => {
  it("extracts structured event draft metadata with high confidence", async () => {
    const provider = getPosterExtractionProvider();
    const mockImageBuffer = Buffer.from("dummy-poster-bytes");

    const draft = await provider.extractFromPoster(mockImageBuffer, "image/png");

    expect(draft).toBeDefined();
    expect(draft.title).toContain("SRM");
    expect(draft.category).toBe("Technical");
    expect(draft.confidenceScore).toBeGreaterThanOrEqual(0.8);
    expect(draft.requiresHumanReview).toBe(true);
    expect(draft.startTime).toBeDefined();
    expect(draft.endTime).toBeDefined();
  });
});
