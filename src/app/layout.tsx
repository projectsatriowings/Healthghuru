import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import SmoothScroll from "@/components/layout/SmoothScroll";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HealthGhuru — Live Better. Feel Stronger.",
  description: "Science-backed wellness platform covering Nutrition, Sleep, Fitness and Mental Health. 20,000+ expert-reviewed articles.",
};

import ConditionalLayout from "@/components/layout/ConditionalLayout";
import CustomCursor from '@/components/ui/CustomCursor';
import { ToastProvider } from "@/components/providers/ToastProvider";
import { DialogProvider } from "@/components/providers/DialogProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSerif.variable} ${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col font-body">
        <ToastProvider>
          <DialogProvider>
            <CustomCursor />
            <SmoothScroll>
              <ConditionalLayout navbar={<Navbar />} footer={<Footer />}>
                {children}
              </ConditionalLayout>
            </SmoothScroll>
          </DialogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
