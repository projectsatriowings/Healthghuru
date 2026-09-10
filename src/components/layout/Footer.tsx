"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, MessageCircle, Share2, Globe, Send, Shield } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 xl:gap-16 2xl:gap-20 mb-12">
          {/* Column 1: Logo & Tagline */}
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="transition-transform hover:scale-105">
              <div className="relative w-48 h-20 -ml-2 md:ml-0">
                <Image
                  src="/images/logo_transparent.png"
                  alt="HealthGhuru Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="font-heading text-lg font-medium text-white/90 mt-2">
              Stay Fit. Stay Healthy.
            </p>
            <p className="text-white/70 text-sm max-w-sm mb-4">
              Your centralized digital health media and medical news aggregation platform.
            </p>
            <div className="flex gap-4 text-white/60">
              <a href="#" className="hover:text-accent transition-colors"><Globe size={20} /></a>
              <a href="#" className="hover:text-accent transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="hover:text-accent transition-colors"><Share2 size={20} /></a>
              <a href="#" className="hover:text-accent transition-colors"><Send size={20} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-xl text-white mb-2">Sections & Media</h4>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                className="text-white/50 hover:text-primary transition-colors flex items-center gap-2 group mt-2 pt-2 border-t border-white/10"
              >
                <Shield size={14} className="text-primary" />
                Editorial Admin
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-xl text-white mb-2">Contact Us</h4>
            <div className="flex items-start gap-3 text-white/70">
              <MapPin className="text-primary shrink-0 mt-1" size={20} />
              <p className="text-sm leading-relaxed">
                No.1A, Gurudev Complex,<br />
                57th Street, Korattur,<br />
                Chennai – 600 080
              </p>
            </div>
            <div className="flex items-center gap-3 text-white/70 mt-2">
              <Phone className="text-primary shrink-0" size={20} />
              <p className="text-sm">+91 88259 48859</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/50">
          <p>Copyright &copy; {new Date().getFullYear()} Healthghuru. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/news" className="hover:text-white transition-colors">Health News</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
