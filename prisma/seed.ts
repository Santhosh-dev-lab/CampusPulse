import {
  PrismaClient,
  UserRole,
  EventStatus,
  RegistrationStatus,
  ApprovalAction,
  ClubRole,
} from "@prisma/client";
import { createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

function generateTicketToken(): { token: string; hash: string } {
  const token = `TKT-${randomBytes(16).toString("hex").toUpperCase()}`;
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

async function main() {
  console.log("🌱 Starting CampusPulse deterministic database seed...");

  // 1. Clean existing records in safe dependency order
  console.log("Cleaning existing records...");
  await prisma.checkIn.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.approvalRecord.deleteMany();
  await prisma.eventInterest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.clubMembership.deleteMany();
  await prisma.club.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.campus.deleteMany();

  // 2. Seed Campuses
  console.log("Creating Campuses...");
  const ktrCampus = await prisma.campus.create({
    data: {
      name: "SRM Institute of Science and Technology, Kattankulathur",
      code: "SRM-KTR",
      city: "Chengalpattu / Chennai",
      state: "Tamil Nadu",
      country: "India",
    },
  });

  const rmpCampus = await prisma.campus.create({
    data: {
      name: "SRM IST, Ramapuram Campus",
      code: "SRM-RMP",
      city: "Ramapuram, Chennai",
      state: "Tamil Nadu",
      country: "India",
    },
  });

  const vdpCampus = await prisma.campus.create({
    data: {
      name: "SRM IST, Vadapalani City Campus",
      code: "SRM-VDP",
      city: "Vadapalani, Chennai",
      state: "Tamil Nadu",
      country: "India",
    },
  });

  // 3. Seed Venues for SRM-KTR
  console.log("Creating Venues for SRM-KTR...");
  const tpGanesanAuditorium = await prisma.venue.create({
    data: {
      name: "Dr. T. P. Ganesan Auditorium (Main Hall)",
      code: "TP-AUD-MAIN",
      building: "TP Ganesan Auditorium Complex",
      floor: "Ground Floor",
      capacity: 3000,
      campusId: ktrCampus.id,
      isIndoor: true,
      facilities: ["Projector", "State-of-the-art Sound System", "Central AC", "Broadcast Stage"],
    },
  });

  const techParkMiniAuditorium = await prisma.venue.create({
    data: {
      name: "Tech Park Mini Auditorium",
      code: "TP-MINI-AUD",
      building: "Tech Park",
      floor: "4th Floor",
      capacity: 350,
      campusId: ktrCampus.id,
      isIndoor: true,
      facilities: ["Dual Projector", "Wireless Mic System", "AC", "Livestream Ready"],
    },
  });

  const javaGreenAmphi = await prisma.venue.create({
    data: {
      name: "Java Green Open Amphitheatre",
      code: "JAVA-AMPHI",
      building: "Java Block Courtyard",
      floor: "Open Ground",
      capacity: 800,
      campusId: ktrCampus.id,
      isIndoor: false,
      facilities: ["Outdoor PA System", "Stage Spotlights", "Acoustic Shell"],
    },
  });

  const bioTechSeminarHall = await prisma.venue.create({
    data: {
      name: "Biotech Seminar Hall",
      code: "BIO-SEM-01",
      building: "Bio-Tech Block",
      floor: "1st Floor",
      capacity: 150,
      campusId: ktrCampus.id,
      isIndoor: true,
      facilities: ["Interactive Smartboard", "AC", "Audio Conferencing"],
    },
  });

  // Venues for SRM-RMP (Ramapuram)
  console.log("Creating Venues for SRM-RMP...");
  await prisma.venue.create({
    data: {
      name: "TRP Auditorium",
      code: "RMP-TRP-AUD",
      building: "TRP Complex / Main Block",
      floor: "Ground Floor",
      capacity: 1200,
      campusId: rmpCampus.id,
      isIndoor: true,
      facilities: ["Pro Line-Array Audio", "Central AC", "Broadcast Lighting", "Green Rooms"],
    },
  });

  const galleryHalls = [
    { num: 1, floor: "1st Floor" },
    { num: 2, floor: "2nd Floor" },
    { num: 3, floor: "3rd Floor" },
    { num: 4, floor: "4th Floor" },
  ];

  for (const gh of galleryHalls) {
    await prisma.venue.create({
      data: {
        name: `Gallery Hall ${gh.num}`,
        code: `RMP-GAL-0${gh.num}`,
        building: "BMS Block",
        floor: gh.floor,
        capacity: 300,
        campusId: rmpCampus.id,
        isIndoor: true,
        facilities: ["Dual Screen HD Projectors", "Central AC", "Podium Mic Array"],
      },
    });
  }

  for (let labNum = 1; labNum <= 7; labNum++) {
    await prisma.venue.create({
      data: {
        name: `MLCP Lab ${labNum}`,
        code: `RMP-MLCP-0${labNum}`,
        building: "MLCP Block",
        floor: `Level ${labNum}`,
        capacity: 120,
        campusId: rmpCampus.id,
        isIndoor: true,
        facilities: ["High-Performance Workstations", "Gigabit Ethernet", "Smart Display", "AC"],
      },
    });
  }

  // Venues for SRM-VDP (Vadapalani)
  console.log("Creating Venues for SRM-VDP...");
  await prisma.venue.create({
    data: {
      name: "Vadapalani Main Auditorium",
      code: "VDP-MAIN-AUD",
      building: "Central Block",
      floor: "2nd Floor",
      capacity: 800,
      campusId: vdpCampus.id,
      isIndoor: true,
      facilities: ["Sound Craft System", "Central AC"],
    },
  });

  await prisma.venue.create({
    data: {
      name: "MBA Seminar Hall",
      code: "VDP-MBA-SEM",
      building: "Management Block",
      floor: "4th Floor",
      capacity: 200,
      campusId: vdpCampus.id,
      isIndoor: true,
      facilities: ["Smart Board", "Video Conferencing"],
    },
  });

  // 4. Seed Core Users (Admin, Organizers, Students)
  console.log("Creating Users...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@srmist.edu.in",
      name: "Dr. K. S. Arunkumar",
      role: UserRole.ADMIN,
      department: "Directorate of Student Affairs",
      campusId: ktrCampus.id,
    },
  });

  const organizerAarav = await prisma.user.create({
    data: {
      email: "aarav.organizer@srmist.edu.in",
      name: "Aarav Sharma",
      role: UserRole.ORGANIZER,
      studentId: "RA2211003010042",
      department: "Computer Science & Engineering",
      yearOfStudy: 3,
      campusId: ktrCampus.id,
    },
  });

  const organizerPooja = await prisma.user.create({
    data: {
      email: "pooja.dance@srmist.edu.in",
      name: "Pooja Sundaram",
      role: UserRole.ORGANIZER,
      studentId: "RA2211003010185",
      department: "Information Technology",
      yearOfStudy: 3,
      campusId: ktrCampus.id,
    },
  });

  const studentSanthosh = await prisma.user.create({
    data: {
      email: "santhosh.student@srmist.edu.in",
      name: "Santhosh Kumar",
      role: UserRole.STUDENT,
      studentId: "RA2311003010512",
      department: "Computer Science",
      yearOfStudy: 2,
      campusId: ktrCampus.id,
    },
  });

  const studentAnanya = await prisma.user.create({
    data: {
      email: "ananya.student@srmist.edu.in",
      name: "Ananya Iyer",
      role: UserRole.STUDENT,
      studentId: "RA2311003010319",
      department: "Data Science",
      yearOfStudy: 2,
      campusId: ktrCampus.id,
    },
  });

  // 5. Seed Clubs & Memberships
  console.log("Creating Clubs & Club Memberships...");
  const dscClub = await prisma.club.create({
    data: {
      name: "Developer Student Club SRM (GDSC)",
      slug: "dsc-srm",
      description: "University chapter inspiring developers to build real-world tech solutions.",
      category: "Technical",
      campusId: ktrCampus.id,
    },
  });

  const grooveClub = await prisma.club.create({
    data: {
      name: "Groove Crew SRM",
      slug: "groove-srm",
      description: "Premier street and contemporary dance society of SRM IST.",
      category: "Cultural",
      campusId: ktrCampus.id,
    },
  });

  await prisma.clubMembership.create({
    data: {
      clubId: dscClub.id,
      userId: organizerAarav.id,
      role: ClubRole.LEAD,
    },
  });

  await prisma.clubMembership.create({
    data: {
      clubId: grooveClub.id,
      userId: organizerPooja.id,
      role: ClubRole.PRESIDENT,
    },
  });

  // 6. Seed Events
  console.log("Creating Events...");
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const hackathonEvent = await prisma.event.create({
    data: {
      title: "HackSRM 2026: 36-Hour National Flagship Hackathon",
      slug: "hacksrm-2026",
      description:
        "Join 500+ builders across India to build decentralized, AI, and smart campus prototypes. Mentorship from industry giants, $10,000 prize pool, free food, and overnight hacking in the Tech Park.",
      category: "Hackathon",
      posterUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      status: EventStatus.PUBLISHED,
      isPublic: true,
      requiresApproval: true,
      capacity: 350,
      registeredCount: 2,
      startTime: new Date(nextWeek.getTime() + 9 * 60 * 60 * 1000), // Next week 9 AM
      endTime: new Date(nextWeek.getTime() + 45 * 60 * 60 * 1000), // +36 hrs
      campusId: ktrCampus.id,
      venueId: techParkMiniAuditorium.id,
      organizerClubId: dscClub.id,
      createdById: organizerAarav.id,
    },
  });

  const danceShowcase = await prisma.event.create({
    data: {
      title: "GrooveMania 2026: Intra-College Dance Showcase & Battle",
      slug: "groovemania-2026",
      description:
        "Experience electrifying dance performances, street face-offs, and live DJ sets by Groove Crew SRM at the Grand TP Ganesan Auditorium.",
      category: "Cultural Fest",
      posterUrl:
        "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
      status: EventStatus.PUBLISHED,
      isPublic: true,
      requiresApproval: true,
      capacity: 2500,
      registeredCount: 1,
      startTime: new Date(dayAfter.getTime() + 17 * 60 * 60 * 1000), // Day after 5 PM
      endTime: new Date(dayAfter.getTime() + 21 * 60 * 60 * 1000), // Day after 9 PM
      campusId: ktrCampus.id,
      venueId: tpGanesanAuditorium.id,
      organizerClubId: grooveClub.id,
      createdById: organizerPooja.id,
    },
  });

  const aiBioLecture = await prisma.event.create({
    data: {
      title: "AI in Clinical Diagnostics: Keynote by Dr. Swaminathan",
      slug: "ai-clinical-diagnostics-2026",
      description:
        "Explore deep learning approaches to early genomic cancer detection and high-throughput cellular screening.",
      category: "Guest Lecture",
      posterUrl:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
      status: EventStatus.APPROVED,
      isPublic: true,
      requiresApproval: true,
      capacity: 150,
      registeredCount: 0,
      startTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000),
      endTime: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000),
      campusId: ktrCampus.id,
      venueId: bioTechSeminarHall.id,
      createdById: organizerAarav.id,
    },
  });

  const draftRobowars = await prisma.event.create({
    data: {
      title: "RoboWars Arena 2026 (Draft Planning)",
      slug: "robowars-arena-2026-draft",
      description:
        "Combative robotics tournament in the open amphitheatre. Pending safety clearance.",
      category: "Technical",
      status: EventStatus.DRAFT,
      isPublic: false,
      requiresApproval: true,
      capacity: 500,
      registeredCount: 0,
      startTime: new Date(nextWeek.getTime() + 50 * 60 * 60 * 1000),
      endTime: new Date(nextWeek.getTime() + 56 * 60 * 60 * 1000),
      campusId: ktrCampus.id,
      venueId: javaGreenAmphi.id,
      createdById: organizerAarav.id,
    },
  });

  // 7. Seed Approval Records for audited events
  console.log("Creating Approval Records...");
  await prisma.approvalRecord.create({
    data: {
      eventId: hackathonEvent.id,
      reviewerId: adminUser.id,
      action: ApprovalAction.APPROVED,
      comments: "Approved with faculty mentor presence requirement for 36hr hackathon.",
      previousStatus: EventStatus.PENDING_APPROVAL,
      nextStatus: EventStatus.APPROVED,
    },
  });

  await prisma.approvalRecord.create({
    data: {
      eventId: danceShowcase.id,
      reviewerId: adminUser.id,
      action: ApprovalAction.APPROVED,
      comments: "Approved for TP Ganesan Main Hall. Strict sound cutoff at 9:00 PM.",
      previousStatus: EventStatus.PENDING_APPROVAL,
      nextStatus: EventStatus.APPROVED,
    },
  });

  // 8. Seed Registrations & Ticket QR Tokens
  console.log("Creating Registrations & Secure Ticket Tokens...");
  const tkt1 = generateTicketToken();
  const reg1 = await prisma.registration.create({
    data: {
      eventId: hackathonEvent.id,
      userId: studentSanthosh.id,
      status: RegistrationStatus.CONFIRMED,
      ticketToken: tkt1.token,
      tokenHash: tkt1.hash,
    },
  });

  const tkt2 = generateTicketToken();
  await prisma.registration.create({
    data: {
      eventId: hackathonEvent.id,
      userId: studentAnanya.id,
      status: RegistrationStatus.CONFIRMED,
      ticketToken: tkt2.token,
      tokenHash: tkt2.hash,
    },
  });

  const tkt3 = generateTicketToken();
  await prisma.registration.create({
    data: {
      eventId: danceShowcase.id,
      userId: studentSanthosh.id,
      status: RegistrationStatus.CONFIRMED,
      ticketToken: tkt3.token,
      tokenHash: tkt3.hash,
    },
  });

  // 9. Seed Check-In (Santhosh checked into HackSRM)
  console.log("Creating CheckIn record...");
  await prisma.checkIn.create({
    data: {
      registrationId: reg1.id,
      checkedInById: organizerAarav.id,
      checkInMethod: "QR_SCAN",
      notes: "Verified SRM ID Card at entrance gate",
    },
  });

  // 10. Seed Notifications
  console.log("Creating Notifications...");
  await prisma.notification.create({
    data: {
      userId: studentSanthosh.id,
      title: "Registration Confirmed: HackSRM 2026",
      message:
        "Your ticket for HackSRM 2026 is confirmed. Present your QR ticket at Tech Park entrance.",
      type: "REGISTRATION_CONFIRMED",
      link: `/tickets/${reg1.id}`,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`- Campuses: 3 (KTR, RMP, VDP)`);
  console.log(`- Venues: 4`);
  console.log(`- Users: 5 (1 Admin, 2 Organizers, 2 Students)`);
  console.log(`- Clubs: 2`);
  console.log(`- Events: 4 (2 Published, 1 Approved, 1 Draft)`);
  console.log(`- Registrations: 3 with cryptographic ticket tokens`);
  console.log(`- Check-Ins: 1`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
