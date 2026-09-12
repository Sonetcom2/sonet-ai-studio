import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact SONET AI STUDIO | Support & Assistance",
  description:
    "Contact SONET AI STUDIO for questions, support, suggestions and assistance with our AI creative platform and digital tools.",
  openGraph: {
    title: "Contact SONET AI STUDIO | Support & Assistance",
    description:
      "Get in touch with SONET AI STUDIO for support, questions and assistance.",
    url: "https://www.sonetaistudio.com/contact",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}