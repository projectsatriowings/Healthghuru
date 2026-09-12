import Link from 'next/link';
import { Calculator, Moon, Stethoscope, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Premium Tools | HealthGhuru Pro',
  description: 'Exclusive health calculators and AI tools for HealthGhuru Pro members.',
};

const TOOLS = [
  {
    title: 'Macro & Calorie Calculator',
    description: 'Find your precise daily calorie and macronutrient targets based on your unique body metrics and fitness goals (weight loss, maintenance, or muscle gain).',
    icon: <Calculator size={32} className="text-white" />,
    href: '/tools/macro-calculator',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    title: 'Sleep Cycle Optimizer',
    description: 'Calculate the exact time you should go to bed or wake up to ensure you complete full 90-minute REM cycles, waking up refreshed and energized.',
    icon: <Moon size={32} className="text-white" />,
    href: '/tools/sleep-calculator',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'AI Health Assistant',
    description: 'Got a quick health question? Ask our advanced AI symptom checker and nutrition assistant for general guidance and information.',
    icon: <Stethoscope size={32} className="text-white" />,
    href: '/tools/symptom-checker',
    color: 'from-accent to-[#ff8a57]'
  }
];

export default function ToolsHubPage() {
  return (
    <div className="site-container py-16">
      <SectionHeader 
        title="Premium Health Tools"
        subtitle="Exclusive utilities designed to help you optimize your daily routines, track your progress, and get instant answers."
        align="center"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {TOOLS.map((tool, index) => (
          <Link 
            key={index} 
            href={tool.href}
            className="group bg-white rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              {tool.icon}
            </div>
            
            <h3 className="font-display text-xl text-dark mb-3 group-hover:text-primary transition-colors">
              {tool.title}
            </h3>
            
            <p className="text-sm text-text-secondary leading-relaxed mb-8 flex-1">
              {tool.description}
            </p>
            
            <div className="flex items-center text-sm font-heading font-semibold text-primary mt-auto">
              Launch Tool <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
