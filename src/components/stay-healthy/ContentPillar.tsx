import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ContentPillarProps {
  label: string;
  title: string;
  body: string;
  bulletPoints: string[];
  imageUrl: string;
  imageAlt: string;
  reversed?: boolean;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

export default function ContentPillar({
  label,
  title,
  body,
  bulletPoints,
  imageUrl,
  imageAlt,
  reversed = false,
  ctaText,
  ctaHref,
  className
}: ContentPillarProps) {
  return (
    <section className={cn("section-padding overflow-hidden", className)}>
      <div className="site-container">
        <div className={cn(
          "flex flex-col gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center",
          // On desktop, row or row-reverse based on 'reversed'
          // On mobile, always column
          reversed ? "lg:flex-row-reverse" : "lg:flex-row"
        )}>
          
          {/* Image Side */}
          <div className="w-full lg:w-1/2">
            <ScrollReveal variant={reversed ? "slideLeft" : "slideRight"} className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </ScrollReveal>
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-1/2">
            <ScrollReveal variant={reversed ? "slideRight" : "slideLeft"}>
              <SectionHeader
                eyebrow={label}
                title={title}
                centered={false}
                className="mb-6"
              />
              
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                {body}
              </p>
              
              <ul className="space-y-4 mb-10">
                {bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
                    <span className="text-text-primary font-medium">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={ctaHref}>
                <Button variant="primary">{ctaText}</Button>
              </Link>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
