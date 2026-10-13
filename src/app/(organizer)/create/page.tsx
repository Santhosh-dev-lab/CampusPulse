import React from "react";
import { prisma } from "@/lib/db";
import { HostEventWorkspace } from "@/components/organizer/host-event-workspace";

export const metadata = {
  title: "Create Event — Luma Studio | CampusPulse",
  description: "Create and publish campus events across SRM University campuses.",
};

const FALLBACK_CAMPUSES = [
  {
    id: "camp-ktr",
    name: "SRM IST Kattankulathur",
    code: "SRM-KTR",
    city: "Chengalpattu / Chennai",
    venues: [
      {
        id: "ven-tp-ganesan",
        name: "Dr. T. P. Ganesan Auditorium",
        building: "TP Ganesan Complex",
        capacity: 3000,
        facilities: ["Air Conditioning", "Line-Array Sound", "VIP Green Rooms"],
      },
      {
        id: "ven-tech-park",
        name: "Tech Park Mini Auditorium",
        building: "Tech Park 4th Floor",
        capacity: 450,
        facilities: ["High-speed Wi-Fi", "Dual Projectors", "Power Strips"],
      },
      {
        id: "ven-biotech-hall",
        name: "Biotech Seminar Hall",
        building: "Bio-Engineering Block",
        capacity: 180,
        facilities: ["Mic Array", "Dual Displays", "Podium"],
      },
      {
        id: "ven-java-green",
        name: "Java Green Open Amphitheatre",
        building: "Java Block Courtyard",
        capacity: 1200,
        facilities: ["Open-Air Stage", "Spotlights", "Acoustic Baffles"],
      },
    ],
  },
  {
    id: "camp-rmp",
    name: "SRM IST Ramapuram",
    code: "SRM-RMP",
    city: "Ramapuram, Chennai",
    venues: [
      {
        id: "ven-rmp-trp",
        name: "TRP Auditorium",
        building: "TRP Complex / Main Block",
        capacity: 1200,
        facilities: ["Pro Line-Array Audio", "Central AC", "Broadcast Lighting"],
      },
      {
        id: "ven-rmp-gal-1",
        name: "Gallery Hall 1",
        building: "BMS Block",
        capacity: 300,
        facilities: ["Dual Screen Projector", "Central AC"],
      },
      {
        id: "ven-rmp-gal-2",
        name: "Gallery Hall 2",
        building: "BMS Block",
        capacity: 300,
        facilities: ["Dual Screen Projector", "Central AC"],
      },
      {
        id: "ven-rmp-gal-3",
        name: "Gallery Hall 3",
        building: "BMS Block",
        capacity: 300,
        facilities: ["Dual Screen Projector", "Central AC"],
      },
      {
        id: "ven-rmp-gal-4",
        name: "Gallery Hall 4",
        building: "BMS Block",
        capacity: 300,
        facilities: ["Dual Screen Projector", "Central AC"],
      },
      {
        id: "ven-rmp-mlcp-1",
        name: "MLCP Lab 1",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
      {
        id: "ven-rmp-mlcp-2",
        name: "MLCP Lab 2",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
      {
        id: "ven-rmp-mlcp-3",
        name: "MLCP Lab 3",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
      {
        id: "ven-rmp-mlcp-4",
        name: "MLCP Lab 4",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
      {
        id: "ven-rmp-mlcp-5",
        name: "MLCP Lab 5",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
      {
        id: "ven-rmp-mlcp-6",
        name: "MLCP Lab 6",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
      {
        id: "ven-rmp-mlcp-7",
        name: "MLCP Lab 7",
        building: "MLCP Block",
        capacity: 120,
        facilities: ["Workstations", "Gigabit LAN", "AC"],
      },
    ],
  },
  {
    id: "camp-vdp",
    name: "SRM IST Vadapalani",
    code: "SRM-VDP",
    city: "Vadapalani, Chennai",
    venues: [
      {
        id: "ven-vdp-audi",
        name: "Vadapalani Central Auditorium",
        building: "Campus Tower",
        capacity: 500,
        facilities: ["Surround Sound", "Stage Lights"],
      },
      {
        id: "ven-vdp-hall",
        name: "CS Tech Seminar Hall",
        building: "Level 3",
        capacity: 150,
        facilities: ["HD Screen", "Wi-Fi"],
      },
    ],
  },
];

export default async function CreateEventPage() {
  let campuses = FALLBACK_CAMPUSES;

  try {
    const dbCampuses = await prisma.campus.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        venues: {
          select: {
            id: true,
            name: true,
            building: true,
            capacity: true,
            facilities: true,
          },
          orderBy: {
            capacity: "desc",
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    });

    if (dbCampuses && dbCampuses.length > 0) {
      campuses = dbCampuses.sort((a, b) =>
        a.code === "SRM-RMP" ? -1 : b.code === "SRM-RMP" ? 1 : 0
      );
    }
  } catch (err) {
    console.warn("Could not query campuses from database, using fallback:", err);
  }

  return <HostEventWorkspace initialCampuses={campuses} />;
}
