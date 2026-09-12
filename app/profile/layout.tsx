import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings | SONET AI STUDIO",
  description:
    "Manage your SONET AI STUDIO profile, account information, AI credits, plan, profile photo and account settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}