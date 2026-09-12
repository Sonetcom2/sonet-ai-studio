import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Transactions | SONET AI STUDIO",
  description:
    "View and track your SONET AI STUDIO subscription payments, transaction history, payment methods and receipts.",
  openGraph: {
    title: "Billing & Transactions | SONET AI STUDIO",
    description:
      "View your SONET AI STUDIO payment transactions, subscription activity and receipts.",
    url: "https://www.sonetaistudio.com/billing",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}