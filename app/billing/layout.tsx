import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Transactions | SONET AI STUDIO",
  description:
    "View and track your SONET AI STUDIO subscription payments, transaction history, payment methods and receipts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}