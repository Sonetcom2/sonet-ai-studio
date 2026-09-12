import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SONET AI STUDIO",
  description:
    "Access your SONET AI STUDIO dashboard, view your AI creations, monitor your credits and quickly launch your creative AI tools.",
  openGraph: {
    title: "Dashboard | SONET AI STUDIO",
    description:
      "Manage your AI creations, credits and creative tools from your SONET AI STUDIO dashboard.",
    url: "https://www.sonetaistudio.com/dashboard",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}