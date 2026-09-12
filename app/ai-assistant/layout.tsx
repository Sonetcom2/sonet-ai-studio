import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Assistant | SONET AI STUDIO",
  description:
    "Use SONET AI Assistant to brainstorm ideas, analyse files, answer questions and create content faster with AI.",
  alternates: {
    canonical: "https://www.sonetaistudio.com/ai-assistant",
  },
  openGraph: {
    title: "AI Assistant | SONET AI STUDIO",
    description:
      "Use SONET AI Assistant to brainstorm ideas, analyse files, answer questions and create content faster with AI.",
    url: "https://www.sonetaistudio.com/ai-assistant",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function AIAssistantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

