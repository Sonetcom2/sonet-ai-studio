import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SONET AI STUDIO",
  description:
    "Sign in to your SONET AI STUDIO account and access your AI creative tools, projects, content and account dashboard.",
  openGraph: {
    title: "Sign In | SONET AI STUDIO",
    description:
      "Sign in to your SONET AI STUDIO account and continue creating with AI.",
    url: "https://www.sonetaistudio.com/login",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}