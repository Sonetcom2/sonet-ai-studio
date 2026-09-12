import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My AI Images | SONET AI STUDIO",
  description:
    "View, download and manage your AI-generated images securely in your SONET AI STUDIO image library.",
  openGraph: {
    title: "My AI Images | SONET AI STUDIO",
    description:
      "View and manage your AI-generated images with SONET AI STUDIO.",
    url: "https://www.sonetaistudio.com/my-images",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function MyImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}