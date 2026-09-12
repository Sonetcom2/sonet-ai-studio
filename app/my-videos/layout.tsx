import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My AI Videos | SONET AI STUDIO",
  description:
    "View, preview, download and manage your AI-generated videos securely in SONET AI STUDIO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}