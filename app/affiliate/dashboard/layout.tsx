import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Dashboard | SONET AI STUDIO",
  description:
    "Manage your SONET AI STUDIO affiliate referrals, commissions and withdrawal requests.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AffiliateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
