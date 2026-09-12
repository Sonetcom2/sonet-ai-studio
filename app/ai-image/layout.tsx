import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Image Generator | SONET AI STUDIO",
  description:
    "Create stunning AI-generated images with SONET AI STUDIO. Turn your ideas into high-quality visuals quickly and easily.",
  alternates: {
    canonical: "https://www.sonetaistudio.com/ai-image",
  },
  openGraph: {
    title: "AI Image Generator | SONET AI STUDIO",
    description:
      "Create stunning AI-generated images with SONET AI STUDIO. Turn your ideas into high-quality visuals quickly and easily.",
    url: "https://www.sonetaistudio.com/ai-image",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function AIImageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
