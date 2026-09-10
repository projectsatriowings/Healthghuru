import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function FiveExercises() {
  const exercises = [
    { name: "Push", image: "/images/exercise_push.png" },
    { name: "Pull", image: "/images/exercise_pull.png" },
    { name: "Squats", image: "/images/exercise_squats.png" },
    { name: "Plank", image: "/images/exercise_plank.png" },
  ];

  return (
    <section className="section-padding bg-gradient-dark text-white">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader
            title="The Only 5 Exercises You'll Ever Need"
            subtitle='"Human evolution led to five basic movements, which encompass nearly all of our everyday motions."'
            light
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 2xl:gap-10 mt-16">
          {exercises.map((exercise, index) => (
            <ScrollReveal key={exercise.name} delay={index * 0.1}>
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group shadow-2xl">
                <Image
                  src={exercise.image}
                  alt={exercise.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />
                <div className="absolute bottom-6 left-0 w-full text-center">
                  <span className="font-display text-2xl text-white tracking-wide">
                    {exercise.name}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
