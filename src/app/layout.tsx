import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CampusPulse — SRM University Smart Events",
  description:
    "Luma-inspired smart campus event discovery, ticketing, conflict-free venue booking, and approval platform for SRM Institute of Science and Technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen text-slate-900 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-600">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
