import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import CustomCursor from "@/components/ui/CustomCursor";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { DialogProvider } from "@/components/providers/DialogProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://healthghuru.com'),
  alternates: {
    canonical: '/',
  },
  title: "HealthGhuru — Live Better. Feel Stronger.",
  description: "Science-backed wellness platform covering Nutrition, Sleep, Fitness and Mental Health. 20,000+ expert-reviewed articles.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" }
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://healthghuru.com/#organization",
      "name": "HealthGhuru",
      "url": "https://healthghuru.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://healthghuru.com/#logo",
        "url": "https://healthghuru.com/images/logo_transparent.png",
        "contentUrl": "https://healthghuru.com/images/logo_transparent.png",
        "caption": "HealthGhuru"
      },
      "image": "https://healthghuru.com/images/logo_transparent.png",
      "description": "Science-backed wellness platform covering Nutrition, Sleep, Fitness and Mental Health. 20,000+ expert-reviewed articles.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-88259-48859",
        "contactType": "customer service",
        "email": "contact@healthghuru.com",
        "areaServed": "IN",
        "availableLanguage": ["en"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No.1A, Gurudev Complex, 57th Street, Korattur",
        "addressLocality": "Chennai",
        "postalCode": "600080",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://healthghuru.com/#website",
      "url": "https://healthghuru.com",
      "name": "HealthGhuru",
      "description": "Live Better. Feel Stronger.",
      "publisher": {
        "@id": "https://healthghuru.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://healthghuru.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSerif.variable} ${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col font-body">
        <GoogleAnalytics />
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
