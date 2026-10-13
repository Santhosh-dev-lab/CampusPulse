import React from "react";
import HomePage from "@/app/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Events Schedule — CampusPulse SRM Ramapuram",
  description: "Chronological timeline of upcoming events at SRM IST Ramapuram Campus.",
};

export default function EventsPage() {
  return <HomePage />;
}
