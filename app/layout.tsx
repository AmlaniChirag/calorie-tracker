import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

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
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" suppressHydrationWarning>
        <body>
          {children}
          <InstallPrompt />
        </body>
      </html>
    </ClerkProvider>
  );
}
