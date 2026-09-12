'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Flame, Beef, Droplets, Wheat } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function MacroCalculatorPage() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [activity, setActivity] = useState<number>(1.2);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [results, setResults] = useState<{ calories: number; protein: number; fat: number; carbs: number } | null>(null);

  const calculateMacros = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !weight || !height) return;

    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    // TDEE
    const tdee = bmr * activity;

    // Adjust for goals
    let targetCalories = tdee;
    if (goal === 'lose') targetCalories -= 500;
    if (goal === 'gain') targetCalories += 300;

    // Macros
    // Protein: 2.2g per kg of body weight
    const protein = weight * 2.2;
    const proteinCals = protein * 4;

    // Fat: 25% of total calories
    const fatCals = targetCalories * 0.25;
    const fat = fatCals / 9;

    // Carbs: The rest
    const remainingCals = targetCalories - proteinCals - fatCals;
    const carbs = Math.max(0, remainingCals / 4);

    setResults({
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs)
    });
  };

  return (
    <div className="site-container py-12">
      <Link href="/tools" className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-8">
        <ArrowLeft size={16} className="mr-2" /> Back to Tools
      </Link>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
          <Calculator size={28} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-dark">Macro & Calorie Calculator</h1>
          <p className="text-text-secondary">Find your optimal daily targets to reach your goals.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <form onSubmit={calculateMacros} className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
            <h3 className="font-heading font-semibold text-lg text-dark mb-6">Your Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-dark">Gender</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setGender('male')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${gender === 'male' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                    Male
                  </button>
                  <button type="button" onClick={() => setGender('female')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${gender === 'female' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                    Female
                  </button>
                </div>
              </div>
              
              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-dark">Age</label>
                <input required type="number" min="15" max="100" value={age} onChange={e => setAge(Number(e.target.value) || '')} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark" placeholder="e.g. 30" />
              </div>
              
              {/* Weight */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-dark">Weight (kg)</label>
                <input required type="number" min="30" max="300" value={weight} onChange={e => setWeight(Number(e.target.value) || '')} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark" placeholder="e.g. 75" />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-dark">Height (cm)</label>
                <input required type="number" min="100" max="250" value={height} onChange={e => setHeight(Number(e.target.value) || '')} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark" placeholder="e.g. 175" />
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-dark">Activity Level</label>
              <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark appearance-none">
                <option value={1.2}>Sedentary (office job, little to no exercise)</option>
                <option value={1.375}>Lightly Active (light exercise 1-3 days/week)</option>
                <option value={1.55}>Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value={1.725}>Very Active (hard exercise 6-7 days/week)</option>
                <option value={1.9}>Extra Active (very hard physical job & training)</option>
              </select>
            </div>

            {/* Goal */}
            <div className="space-y-2 mb-8">
              <label className="text-sm font-semibold text-dark">Your Goal</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setGoal('lose')} className={`py-3 rounded-xl text-xs font-semibold border transition-all ${goal === 'lose' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                  Weight Loss
                </button>
                <button type="button" onClick={() => setGoal('maintain')} className={`py-3 rounded-xl text-xs font-semibold border transition-all ${goal === 'maintain' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                  Maintenance
                </button>
                <button type="button" onClick={() => setGoal('gain')} className={`py-3 rounded-xl text-xs font-semibold border transition-all ${goal === 'gain' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                  Muscle Gain
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-white font-heading font-bold hover:bg-primary-dark transition-colors shadow-sm">
              Calculate Macros
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          {results ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-28 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <h3 className="font-heading font-bold text-xl text-dark mb-2">Your Daily Targets</h3>
              <p className="text-sm text-text-secondary mb-8">Stick to these numbers consistently to see results.</p>
              
              <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-2xl border border-orange-100 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-0.5">Total Calories</div>
                  <div className="font-display text-3xl text-dark leading-none">{results.calories} <span className="text-lg text-text-muted font-heading font-medium">kcal</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                      <Beef size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark">Protein</div>
                      <div className="text-xs text-text-muted">Muscle repair</div>
                    </div>
                  </div>
                  <div className="font-display text-xl text-dark">{results.protein}g</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                      <Droplets size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark">Fats</div>
                      <div className="text-xs text-text-muted">Hormone health</div>
                    </div>
                  </div>
                  <div className="font-display text-xl text-dark">{results.fat}g</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Wheat size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark">Carbs</div>
                      <div className="text-xs text-text-muted">Primary energy</div>
                    </div>
                  </div>
                  <div className="font-display text-xl text-dark">{results.carbs}g</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <Calculator size={48} className="text-border mb-4" />
              <h3 className="font-heading font-semibold text-text-secondary mb-2">Awaiting Inputs</h3>
              <p className="text-sm text-text-muted max-w-[250px]">Fill out your details on the left and hit calculate to see your custom macros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
