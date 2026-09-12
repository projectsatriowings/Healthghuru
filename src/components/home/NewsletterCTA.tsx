"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        setEmail("");
      } else {
        setErrorMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-primary py-12 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-dark opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="site-container-narrow relative z-10 text-center">
        <ScrollReveal variant="fadeUp">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white mb-4">
            <Mail size={24} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl 2xl:text-5xl text-white mb-3">
            Join 5,000+ Health Enthusiasts
          </h2>
          <p className="text-white/90 text-base md:text-lg 2xl:text-xl font-body max-w-2xl 2xl:max-w-3xl mx-auto mb-6 leading-relaxed">
            Get personalized health content, expert tips, and exclusive resources delivered straight to your inbox every week.
          </p>
          
          {subscribed ? (
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-heading font-semibold shadow-lg text-lg border border-white/30 animate-fade-in">
              <CheckCircle size={24} className="text-accent" />
              Thank you for subscribing to HealthGuru!
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg 2xl:max-w-xl mx-auto" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-grow px-6 py-4 rounded-full text-text-primary focus:outline-none focus:ring-4 focus:ring-white/30 shadow-inner disabled:opacity-70"
              />
              <Button variant="accent" size="lg" type="submit" disabled={loading} className="w-full sm:w-auto shadow-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Subscribe Now"}
              </Button>
            </form>
          )}

          {errorMessage && (
            <p className="text-red-200 text-sm mt-3 font-medium bg-red-900/30 py-1.5 px-4 rounded-full inline-block">
              {errorMessage}
            </p>
          )}

          <p className="text-white/60 text-sm mt-4">We care about your data in our privacy policy.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}

