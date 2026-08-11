import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SONET AI STUDIO",
  description: "AI Platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}