import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account | SONET AI STUDIO",
  description:
    "Create your SONET AI STUDIO account and start using AI-powered tools for images, videos, prompts, voice content and marketing content.",
  openGraph: {
    title: "Create Your Account | SONET AI STUDIO",
    description:
      "Join SONET AI STUDIO and start creating professional digital content with AI.",
    url: "https://www.sonetaistudio.com/register",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}