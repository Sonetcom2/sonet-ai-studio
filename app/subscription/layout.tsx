import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Subscription | SONET AI STUDIO",
  description:
    "Manage your SONET AI STUDIO subscription, view your current plan, check remaining AI credits and manage your account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}