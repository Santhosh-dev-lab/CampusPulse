export const APP_CONFIG = {
  name: "CampusPulse",
  tagline: "Smart Campus Event Discovery & Management",
  university: "SRM Institute of Science and Technology",
  defaultCampusCode: "SRM-KTR",
  defaultTimezone: "Asia/Kolkata",
  currency: "INR",
  categories: [
    "All",
    "Hackathon",
    "Workshop",
    "Cultural Fest",
    "Guest Lecture",
    "Technical",
    "Sports",
  ] as const,
  campuses: [
    { code: "SRM-KTR", name: "SRM Kattankulathur (Main Campus)", city: "Chengalpattu / Chennai" },
    { code: "SRM-RMP", name: "SRM Ramapuram Campus", city: "Ramapuram, Chennai" },
    { code: "SRM-VDP", name: "SRM Vadapalani City Campus", city: "Vadapalani, Chennai" },
  ],
};
