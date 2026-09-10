import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Shield, Heart, MapPin, Phone, Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/Card";
import TrustBar from "@/components/home/TrustBar";

export const metadata: Metadata = {
  title: "About Us | HealthGhuru",
  description: "Learn more about our mission to provide science-backed wellness advice.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-surface min-h-[40vh] flex items-center pt-8 sm:pt-12 pb-12">
        <div className="site-container">
          <ScrollReveal variant="fadeUp" className="text-center">
            <SectionHeader
              eyebrow="WHO WE ARE"
              title="About HealthGhuru"
              subtitle="Your trusted source for evidence-based health and wellness information."
            />
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary font-heading">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>&rarr;</span>
              <span className="text-primary font-medium">About Us</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-white">
        <div className="site-container">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
              <ScrollReveal variant="slideRight" className="relative w-full aspect-square md:aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl">
                <Image
                  src="/images/nutrition_pillar.png"
                  alt="Our Mission"
                  fill
                  className="object-cover"
                />
              </ScrollReveal>
            </div>
            
            <div className="w-full lg:w-1/2">
              <ScrollReveal variant="slideLeft">
                <SectionHeader eyebrow="OUR MISSION" title="Empowering Your Wellness Journey" centered={false} className="mb-6" />
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  At HealthGhuru, we believe that everyone deserves access to reliable, science-backed health information. In a world full of confusing wellness trends and misinformation, we strive to be your clear, trusted guide.
                </p>
                <p className="text-text-secondary text-lg leading-relaxed">
                  Our mission is to empower individuals to make informed decisions about their health through expert-reviewed content spanning nutrition, fitness, sleep, and mental health. We translate complex medical research into actionable, everyday advice.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-surface-alt">
        <div className="site-container">
          <ScrollReveal variant="fadeIn">
            <SectionHeader title="Our Core Values" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <ScrollReveal delay={0.1}>
              <Card className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Shield size={32} />
                </div>
                <h3 className="font-heading text-xl font-bold text-dark mb-4">Science-Backed</h3>
                <p className="text-text-secondary leading-relaxed">
                  Every piece of content is rooted in scientific evidence and peer-reviewed research, ensuring you get facts, not fads.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Card className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Heart size={32} />
                </div>
                <h3 className="font-heading text-xl font-bold text-dark mb-4">Accessible</h3>
                <p className="text-text-secondary leading-relaxed">
                  We break down complex medical jargon into easy-to-understand, actionable advice for your daily life.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <Card className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-heading text-xl font-bold text-dark mb-4">Comprehensive</h3>
                <p className="text-text-secondary leading-relaxed">
                  Health is holistic. We cover nutrition, fitness, mental wellbeing, and sleep to support your whole self.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Review Process */}
      <section className="section-padding bg-white">
        <div className="site-container-narrow text-center">
          <ScrollReveal variant="fadeUp">
            <SectionHeader title="Medical Expert Review Process" />
            <p className="text-text-secondary text-lg mb-12">
              Our content undergoes a rigorous multi-step editorial process to guarantee accuracy and safety.
            </p>

            <div className="flex flex-col md:flex-row justify-between relative">
              <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-border -z-10" />
              
              {[
                { step: "01", title: "Research & Writing", desc: "Written by experienced health journalists using recent studies." },
                { step: "02", title: "Medical Review", desc: "Reviewed by our Medical Advisory Board of certified experts." },
                { step: "03", title: "Final Polish", desc: "Edited for clarity, tone, and readability before publishing." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center w-full md:w-1/3 mb-8 md:mb-0 bg-white">
                  <div className="w-16 h-16 rounded-full bg-primary text-white font-mono text-2xl font-bold flex items-center justify-center shadow-lg mb-6 border-4 border-white">
                    {item.step}
                  </div>
                  <h4 className="font-heading font-bold text-dark mb-2">{item.title}</h4>
                  <p className="text-text-muted text-sm px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-surface-alt">
        <div className="site-container">
          <ScrollReveal variant="fadeIn">
            <div className="bg-white rounded-[32px] p-8 md:p-16 shadow-xl border border-primary/10 max-w-5xl 2xl:max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="font-display text-3xl text-dark mb-6">Get in Touch</h3>
                  <p className="text-text-secondary mb-8 leading-relaxed">
                    Have a question, feedback, or just want to say hello? Our team is always here to help you on your wellness journey.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="text-primary" size={24} />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-dark mb-1">Our Office</h4>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          No.1A, Gurudev Complex,<br />
                          57th Street, Korattur,<br />
                          Chennai – 600 080, India
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="text-primary" size={24} />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-dark mb-1">Phone</h4>
                        <p className="text-text-secondary text-sm">+91 88259 48859</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="text-primary" size={24} />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-dark mb-1">Email</h4>
                        <p className="text-text-secondary text-sm">hello@healthghuru.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Embedded Map Placeholder */}
                <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden relative shadow-inner bg-gray-100 flex items-center justify-center">
                  {/* Ideally, put an iframe Google Map here, for now using a placeholder image */}
                  <Image 
                    src="/images/fitness_pillar.png" 
                    alt="Map" 
                    fill 
                    className="object-cover opacity-60 grayscale" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full font-heading text-primary font-bold shadow-lg flex items-center gap-2">
                      <MapPin size={20} /> Chennai, India
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
