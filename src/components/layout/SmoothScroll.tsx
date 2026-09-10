"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const dashboardRoutes = [
      '/vault', '/records', '/goals', 
      '/library', '/profile', '/admin'
    ];
    
    // Disable smooth scroll on dashboard routes since they have their own inner scroll containers
    if (dashboardRoutes.some(route => pathname?.startsWith(route))) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // Initialize Lenis once if not already initialized
    if (!lenisRef.current) {
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        rafIdRef.current = requestAnimationFrame(raf);
      };

      rafIdRef.current = requestAnimationFrame(raf);
    } else {
      // On route change, reset scroll position smoothly
      lenisRef.current.scrollTo(0, { immediate: true });
    }

    return () => {
      // Cleanup on unmount
    };
  }, [pathname]);

  // Global unmount cleanup
  useEffect(() => {
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
}
