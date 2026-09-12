import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SONET AI STUDIO",
  description:
    "Access your SONET AI STUDIO dashboard, view your AI creations, monitor your credits and quickly launch your creative AI tools.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}