import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "@/components/shared/event-card";

describe("EventCard Component", () => {
  const sampleEvent = {
    id: "evt-test-1",
    title: "SRM Open Source Summit 2026",
    slug: "srm-oss-2026",
    category: "Technical",
    posterUrl: null,
    venueName: "Tech Park Mini Auditorium",
    startTime: "2026-10-24T09:00:00.000Z",
    capacity: 200,
    registeredCount: 150,
    organizerClubName: "GDSC SRM",
  };

  it("renders event title, club name, and venue correctly", () => {
    render(<EventCard {...sampleEvent} />);

    expect(screen.getByText("SRM Open Source Summit 2026")).toBeInTheDocument();
    expect(screen.getByText("GDSC SRM")).toBeInTheDocument();
    expect(screen.getByText("Tech Park Mini Auditorium")).toBeInTheDocument();
  });

  it("displays remaining spots accurately", () => {
    render(<EventCard {...sampleEvent} />);
    expect(screen.getByText(/50 spots left/i)).toBeInTheDocument();
  });

  it("indicates Housefull when registered count reaches capacity", () => {
    const fullEvent = {
      ...sampleEvent,
      registeredCount: 200,
    };
    render(<EventCard {...fullEvent} />);
    expect(screen.getByText(/Housefull/i)).toBeInTheDocument();
  });
});
