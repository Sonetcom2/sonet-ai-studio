import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SONET AI STUDIO Affiliate Program | Earn With Referrals",
  description:
    "Join the SONET AI STUDIO Affiliate Program, share your referral link and earn commissions by introducing creators, businesses and entrepreneurs to AI-powered creative tools.",
  openGraph: {
    title: "SONET AI STUDIO Affiliate Program | Earn With Referrals",
    description:
      "Join the SONET AI STUDIO Affiliate Program and earn commissions by sharing AI-powered creative tools with your audience.",
    url: "https://www.sonetaistudio.com/affiliate",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}