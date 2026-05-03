import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import InstallPrompt from "@/components/InstallPrompt";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CalTrack — Calorie & Macro Tracker",
  description: "Track calories, macros, water, and workouts. Built for Indian & global food lovers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalTrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <head>
          {/* Capture beforeinstallprompt BEFORE React hydrates — event fires early */}
          <script dangerouslySetInnerHTML={{ __html: `
            window.__pwaPrompt = null;
            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              window.__pwaPrompt = e;
            });
          `}} />
        </head>
        <body>
          {children}
          <InstallPrompt />
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}
