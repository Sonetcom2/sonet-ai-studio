import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Subscription | SONET AI STUDIO",
  description:
    "Manage your SONET AI STUDIO subscription, view your current plan, check remaining AI credits and manage your account.",
  openGraph: {
    title: "My Subscription | SONET AI STUDIO",
    description:
      "Manage your SONET AI STUDIO plan, AI credits and subscription settings.",
    url: "https://www.sonetaistudio.com/subscription",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}