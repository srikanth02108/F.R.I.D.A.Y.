import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { FridayThemeProvider } from "@/components/theme/friday-theme-provider";
import { BRAND_FULL_NAME } from "@/lib/brand";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND_FULL_NAME,
    template: `%s | F.R.I.D.A.Y.`,
  },
  description:
    "Flexible Resume & Interview Optimizer for a Dynamic Adaptation System — AI-powered ATS optimization and interview coaching.",
  icons: {
    icon: [{ url: "/friday-logo.png", type: "image/png" }],
    apple: "/friday-logo.png",
    shortcut: "/friday-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <FridayThemeProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#0f172a",
                color: "#f8fafc",
              },
            }}
          />
        </FridayThemeProvider>
      </body>
    </html>
  );
}
