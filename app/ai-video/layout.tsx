import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Generator | SONET AI STUDIO",
  description:
    "Create cinematic AI-generated videos with SONET AI STUDIO. Turn your ideas into engaging videos with custom styles, camera movements, aspect ratios and audio.",
  alternates: {
    canonical: "https://www.sonetaistudio.com/ai-video",
  },
  openGraph: {
    title: "AI Video Generator | SONET AI STUDIO",
    description:
      "Create cinematic AI-generated videos with SONET AI STUDIO using custom styles, camera movements, aspect ratios and audio.",
    url: "https://www.sonetaistudio.com/ai-video",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function AIVideoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
