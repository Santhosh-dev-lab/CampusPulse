import { describe, it, expect } from "vitest";
import { doIntervalsOverlap } from "@/server/services/venue.service";

describe("Venue Booking Interval Overlap Logic", () => {
  const baseStart = new Date("2026-10-24T10:00:00.000Z");
  const baseEnd = new Date("2026-10-24T14:00:00.000Z");

  it("detects exact interval overlap", () => {
    expect(doIntervalsOverlap(baseStart, baseEnd, baseStart, baseEnd)).toBe(true);
  });

  it("detects subset interval (new event completely inside existing event)", () => {
    const subsetStart = new Date("2026-10-24T11:00:00.000Z");
    const subsetEnd = new Date("2026-10-24T13:00:00.000Z");
    expect(doIntervalsOverlap(baseStart, baseEnd, subsetStart, subsetEnd)).toBe(true);
  });

  it("detects partial start overlap (new event starts before and ends inside)", () => {
    const overlappingStart = new Date("2026-10-24T09:00:00.000Z");
    const overlappingEnd = new Date("2026-10-24T11:00:00.000Z");
    expect(doIntervalsOverlap(baseStart, baseEnd, overlappingStart, overlappingEnd)).toBe(true);
  });

  it("detects partial end overlap (new event starts inside and ends after)", () => {
    const overlappingStart = new Date("2026-10-24T13:00:00.000Z");
    const overlappingEnd = new Date("2026-10-24T16:00:00.000Z");
    expect(doIntervalsOverlap(baseStart, baseEnd, overlappingStart, overlappingEnd)).toBe(true);
  });

  it("permits back-to-back non-overlapping bookings (end time equals start time)", () => {
    const earlierStart = new Date("2026-10-24T08:00:00.000Z");
    const earlierEnd = new Date("2026-10-24T10:00:00.000Z"); // Adjacent boundary
    expect(doIntervalsOverlap(baseStart, baseEnd, earlierStart, earlierEnd)).toBe(false);

    const laterStart = new Date("2026-10-24T14:00:00.000Z"); // Adjacent boundary
    const laterEnd = new Date("2026-10-24T16:00:00.000Z");
    expect(doIntervalsOverlap(baseStart, baseEnd, laterStart, laterEnd)).toBe(false);
  });

  it("permits completely disjoint intervals", () => {
    const disjointStart = new Date("2026-10-25T10:00:00.000Z");
    const disjointEnd = new Date("2026-10-25T14:00:00.000Z");
    expect(doIntervalsOverlap(baseStart, baseEnd, disjointStart, disjointEnd)).toBe(false);
  });
});
