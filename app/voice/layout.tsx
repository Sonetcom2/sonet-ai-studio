import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voice Generator | SONET AI STUDIO",
  description:
    "Turn text into natural AI speech with SONET AI STUDIO. Choose professional voices, create voiceovers and announcements, and download your generated MP3 audio.",
  alternates: {
    canonical: "https://www.sonetaistudio.com/voice",
  },
  openGraph: {
    title: "AI Voice Generator | SONET AI STUDIO",
    description:
      "Turn text into natural AI speech with SONET AI STUDIO. Create voiceovers, announcements, storytelling and social media audio.",
    url: "https://www.sonetaistudio.com/voice",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function VoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
