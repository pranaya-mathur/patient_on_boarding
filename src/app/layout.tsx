import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--fo-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--fo-serif",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareFront · Patient intake",
  description: "Pre-visit registration and insurance intake (MVP scaffold).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(sans.variable, serif.variable)} suppressHydrationWarning>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
