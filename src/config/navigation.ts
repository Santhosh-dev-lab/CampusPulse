export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  role?: "STUDENT" | "ORGANIZER" | "ADMIN";
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Explore Events", href: "/" },
  { label: "My Tickets", href: "/my-tickets", role: "STUDENT" },
  { label: "Organizer Hub", href: "/dashboard", role: "ORGANIZER" },
  { label: "Admin Approvals", href: "/approvals", badge: "2 pending", role: "ADMIN" },
];
