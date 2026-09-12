import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings | SONET AI STUDIO",
  description:
    "Manage your SONET AI STUDIO profile, account information, AI credits, plan, profile photo and account settings.",
  openGraph: {
    title: "Profile Settings | SONET AI STUDIO",
    description:
      "Manage your profile, account information, credits and plan with SONET AI STUDIO.",
    url: "https://www.sonetaistudio.com/profile",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}