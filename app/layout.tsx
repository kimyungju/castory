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

export const metadata: Metadata = {
  title: "Podcaster",
  description: "Generate your podcasts using AI",
  icons: {
    icon: "/icons/logo.svg",
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
