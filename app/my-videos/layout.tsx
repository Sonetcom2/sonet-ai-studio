import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My AI Videos | SONET AI STUDIO",
  description:
    "View, preview, download and manage your AI-generated videos securely in SONET AI STUDIO.",
  openGraph: {
    title: "My AI Videos | SONET AI STUDIO",
    description:
      "View, preview and manage your AI-generated videos with SONET AI STUDIO.",
    url: "https://www.sonetaistudio.com/my-videos",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function MyVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}