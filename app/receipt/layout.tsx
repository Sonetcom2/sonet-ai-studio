import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipt | SONET AI STUDIO",
  description:
   "View your SONET AI STUDIO payment receipt and transaction details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReceiptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
