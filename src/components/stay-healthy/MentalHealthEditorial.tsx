import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function MentalHealthEditorial() {
  const blocks = [
    {
      title: "Mental Health is the Foundation of a Happy Life",
      content: "When we are mentally healthy, we can enjoy life, our environment, and the people in it. We can be creative, learn, try new things, and take risks. We are better able to cope with difficult times in our personal and professional lives."
    },
    {
      title: "Mental Health Plays a Crucial Role in Relationships",
      content: "Good mental health enables you to connect with others meaningfully. It helps you empathize, communicate effectively, and maintain healthy boundaries, which are all essential for sustaining strong family, romantic, and platonic relationships."
    },
    {
      title: "Criminal Behavior and Victimization Connected to Mental Health",
      content: "Addressing mental health issues early can prevent adverse outcomes. While most people with mental health conditions are never violent, lack of treatment and support can sometimes lead to vulnerability and negative life trajectories."
    },
    {
      title: "Mental Health Affects Physical Health",
      content: "The mind and body are intrinsically linked. Chronic stress and poor mental health can weaken the immune system, increase the risk of heart disease, and cause gastrointestinal issues, showing why treating both is vital for overall wellness."
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="Mental Health is the Foundation of a Happy Life" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-10 2xl:gap-12 mt-12">
          {blocks.map((block, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <Card className="h-full p-8 border-t-4 border-t-primary rounded-t-sm rounded-b-card">
                <h3 className="font-heading font-bold text-xl text-dark mb-4">
                  {block.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {block.content}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
