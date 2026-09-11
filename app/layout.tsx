import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sonetaistudio.com"),

  title: "SONET AI STUDIO | AI Creative Platform",

  description:
    "SONET AI STUDIO is an all-in-one AI creative platform for generating images, videos, prompts, voice content and marketing content faster.",

  openGraph: {
    title: "SONET AI STUDIO | AI Creative Platform",

    description:
      "Create images, videos, prompts, voice content and marketing content with SONET AI STUDIO.",

    url: "https://www.sonetaistudio.com",

    siteName: "SONET AI STUDIO",

    type: "website",

    images: [
      {
        url: "/images/sonet-ai-studio-og.png",
        width: 1536,
        height: 1024,
        alt: "SONET AI STUDIO — AI Creative Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "SONET AI STUDIO | AI Creative Platform",

    description:
      "Create images, videos, prompts, voice content and marketing content with SONET AI STUDIO.",

    images: ["/images/sonet-ai-studio-og.png"],
  },
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
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
        >{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;
          n.push=n;
          n.loaded=!0;
          n.version='2.0';
          n.queue=[];
          t=b.createElement(e);
          t.async=!0;
          t.src=v;
          s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
          }(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');

          fbq('init', '1455599342937490');
          fbq('track', 'PageView');
        `}</Script>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}