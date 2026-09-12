import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My AI Images | SONET AI STUDIO",
  description:
    "View, download and manage your AI-generated images securely in your SONET AI STUDIO image library.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}