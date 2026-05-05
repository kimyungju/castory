import type { Metadata } from "next";
import { Syne, Crimson_Pro } from "next/font/google";
import "./globals.css";
import ConvexClerkProvider from "./providers/ConvexClerkProvider";
import { AudioProvider } from "./providers/AudioProvider";
import { Toaster } from "sonner";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://castory-ai.vercel.app"),
  title: {
    default: "Castory — AI Podcast Platform",
    template: "%s | Castory",
  },
  description:
    "AI-powered podcast platform that turns trending news or custom topics into polished episodes — script, voice, and cover art — in minutes.",
  icons: {
    icon: "/icons/logo.svg",
  },
  openGraph: {
    title: "Castory — AI Podcast Platform",
    description:
      "Turn trending news or custom topics into polished podcasts — script, voice, and cover art — in minutes.",
    url: "https://castory-ai.vercel.app",
    siteName: "Castory",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Castory — AI Podcast Platform",
    description:
      "Turn trending news or custom topics into polished podcasts — script, voice, and cover art — in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${crimsonPro.variable} antialiased`}
      >
        <ConvexClerkProvider>
          <AudioProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AudioProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
