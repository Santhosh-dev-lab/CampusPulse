import { prisma } from "../src/lib/db";
import { EventStatus, UserRole } from "@prisma/client";

async function main() {
  console.log("Syncing SRM Ramapuram flagship events to PostgreSQL...");

  let rmpCampus = await prisma.campus.findUnique({ where: { code: "SRM-RMP" } });
  if (!rmpCampus) {
    rmpCampus = await prisma.campus.create({
      data: {
        name: "SRM IST, Ramapuram Campus",
        code: "SRM-RMP",
        city: "Ramapuram, Chennai",
        state: "Tamil Nadu",
      },
    });
  }

  let user = await prisma.user.findFirst({
    where: { role: { in: [UserRole.ADMIN, UserRole.ORGANIZER] } },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "organizer.rmp@srmist.edu.in",
        name: "SRM Ramapuram Events Lead",
        role: UserRole.ORGANIZER,
        campusId: rmpCampus.id,
      },
    });
  }

  let club = await prisma.club.findFirst({ where: { campusId: rmpCampus.id } });
  if (!club) {
    club = await prisma.club.create({
      data: {
        name: "GDSC SRM Ramapuram",
        slug: "gdsc-srm-rmp",
        description: "Google Developer Student Clubs & Tech Community",
        category: "Technical",
        campusId: rmpCampus.id,
      },
    });
  }

  const getVenue = async (name: string) => {
    let v = await prisma.venue.findFirst({
      where: { campusId: rmpCampus.id, name: { contains: name, mode: "insensitive" } },
    });
    if (!v) {
      v = await prisma.venue.create({
        data: {
          name,
          building: "SRM Ramapuram Campus",
          capacity: 300,
          campusId: rmpCampus.id,
          facilities: ["AC", "Audio System", "Projector"],
        },
      });
    }
    return v;
  };

  const vGal1 = await getVenue("Gallery Hall 1");
  const vTrp = await getVenue("TRP Auditorium");
  const vGal3 = await getVenue("Gallery Hall 3");
  const vMlcp3 = await getVenue("MLCP Lab 3");

  const rmpEvents = [
    {
      id: "evt-ai-biotech",
      title: "AI in Clinical Diagnostics: Keynote Lecture & Live Demo",
      slug: "evt-ai-biotech",
      category: "Guest Lecture",
      posterUrl:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
      venueId: vGal1.id,
      capacity: 300,
      registeredCount: 140,
      startTime: new Date("2026-10-15T09:30:00.000Z"),
      endTime: new Date("2026-10-15T12:30:00.000Z"),
      description:
        "Explore deep learning approaches to early genomic cancer detection and high-throughput cellular screening with Dr. Swaminathan in Gallery Hall 1 at SRM Ramapuram.",
    },
    {
      id: "evt-hack-srm",
      title: "HackSRM RMP 2026: 36-Hour National Flagship Hackathon",
      slug: "evt-hack-srm",
      category: "Hackathon",
      posterUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      venueId: vTrp.id,
      capacity: 1200,
      registeredCount: 840,
      startTime: new Date("2026-10-23T10:00:00.000Z"),
      endTime: new Date("2026-10-24T22:00:00.000Z"),
      description:
        "Join 500+ student builders across India to build decentralized, AI, and smart campus prototypes. Mentorship from industry leaders, cash prizes, free food, and overnight hacking in the TRP Auditorium at SRM Ramapuram.",
    },
    {
      id: "evt-groove-mania",
      title: "GrooveMania 2026: Ramapuram Intra-College Dance Showcase",
      slug: "evt-groove-mania",
      category: "Cultural Fest",
      posterUrl:
        "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
      venueId: vTrp.id,
      capacity: 1200,
      registeredCount: 950,
      startTime: new Date("2026-11-14T17:00:00.000Z"),
      endTime: new Date("2026-11-14T21:00:00.000Z"),
      description:
        "Experience electrifying dance performances, street face-offs, and live DJ sets by Groove Crew RMP at the Grand TRP Auditorium in SRM Ramapuram.",
    },
    {
      id: "evt-robowars",
      title: "RoboWars 2026: Combat Bot Arena Clash at Ramapuram",
      slug: "evt-robowars",
      category: "Technical",
      posterUrl:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      venueId: vGal3.id,
      capacity: 200,
      registeredCount: 185,
      startTime: new Date("2026-11-25T11:00:00.000Z"),
      endTime: new Date("2026-11-25T16:00:00.000Z"),
      description:
        "Combative robotics tournament featuring 15kg and 30kg combat bots clashing inside bulletproof polycarbonate arenas at Gallery Hall 3, SRM Ramapuram.",
    },
    {
      id: "evt-cloud-k8s",
      title: "Cloud Native & Kubernetes Hands-On Masterclass",
      slug: "evt-cloud-k8s",
      category: "Workshops",
      posterUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      venueId: vMlcp3.id,
      capacity: 120,
      registeredCount: 92,
      startTime: new Date("2026-12-04T14:00:00.000Z"),
      endTime: new Date("2026-12-04T17:00:00.000Z"),
      description:
        "Practical hands-on lab containerizing microservices, setting up Helm charts, and deploying on multi-node Kubernetes clusters in MLCP Lab 3.",
    },
  ];

  for (const ev of rmpEvents) {
    await prisma.event.upsert({
      where: { id: ev.id },
      update: {
        title: ev.title,
        slug: ev.slug,
        category: ev.category,
        posterUrl: ev.posterUrl,
        status: EventStatus.PUBLISHED,
        capacity: ev.capacity,
        registeredCount: ev.registeredCount,
        startTime: ev.startTime,
        endTime: ev.endTime,
        description: ev.description,
        venueId: ev.venueId,
        campusId: rmpCampus.id,
        organizerClubId: club.id,
        createdById: user.id,
      },
      create: {
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        category: ev.category,
        posterUrl: ev.posterUrl,
        status: EventStatus.PUBLISHED,
        isPublic: true,
        capacity: ev.capacity,
        registeredCount: ev.registeredCount,
        startTime: ev.startTime,
        endTime: ev.endTime,
        description: ev.description,
        venueId: ev.venueId,
        campusId: rmpCampus.id,
        organizerClubId: club.id,
        createdById: user.id,
      },
    });
    console.log("Upserted event:", ev.id, "-", ev.title);
  }

  console.log("All SRM Ramapuram events synced successfully to PostgreSQL!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
