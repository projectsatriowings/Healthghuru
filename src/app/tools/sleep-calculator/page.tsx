'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun, Clock, Sparkles } from 'lucide-react';
import { format, addMinutes, subMinutes, parse } from 'date-fns';

export default function SleepCalculatorPage() {
  const [mode, setMode] = useState<'wake' | 'bed'>('wake');
  const [time, setTime] = useState('07:00');
  const [results, setResults] = useState<{ time: string; cycles: number; hours: number }[]>([]);

  const calculateCycles = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    // Parse the input time (assumed today for calculation purposes)
    const baseDate = parse(time, 'HH:mm', new Date());
    
    // Average time to fall asleep
    const FALL_ASLEEP_MINUTES = 15;
    const CYCLE_LENGTH = 90; // 90 minutes per sleep cycle

    const newResults = [];

    if (mode === 'wake') {
      // If I want to wake up at X, when should I go to bed?
      // We calculate backwards. 6 cycles, 5 cycles, 4 cycles, 3 cycles.
      // But we must also subtract the 15 minutes it takes to fall asleep.
      for (let i = 6; i >= 3; i--) {
        const totalSleepMinutes = i * CYCLE_LENGTH;
        // The time they need to GET IN BED is Wake Time - total sleep time - 15 minutes
        const bedTime = subMinutes(baseDate, totalSleepMinutes + FALL_ASLEEP_MINUTES);
        newResults.push({
          time: format(bedTime, 'h:mm a'),
          cycles: i,
          hours: totalSleepMinutes / 60
        });
      }
    } else {
      // If I go to bed at X, when should I wake up?
      // We calculate forwards. But first, add 15 minutes to fall asleep.
      // Then add cycles.
      const asleepTime = addMinutes(baseDate, FALL_ASLEEP_MINUTES);
      for (let i = 3; i <= 6; i++) {
        const totalSleepMinutes = i * CYCLE_LENGTH;
        const wakeTime = addMinutes(asleepTime, totalSleepMinutes);
        newResults.push({
          time: format(wakeTime, 'h:mm a'),
          cycles: i,
          hours: totalSleepMinutes / 60
        });
      }
      // Reverse so the 6 cycles (optimal) is at the top, like the wake mode
      newResults.reverse();
    }

    setResults(newResults);
  };

  return (
    <div className="site-container-tool py-8 sm:py-12">
      <Link href="/tools" className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} className="mr-2" /> Back to Tools
      </Link>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shrink-0">
          <Moon size={28} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-dark">Sleep Cycle Optimizer</h1>
          <p className="text-text-secondary text-sm sm:text-base">Wake up feeling refreshed by completing full 90-minute sleep cycles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Calculator Area (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <div>
              <form onSubmit={calculateCycles} className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
                <h3 className="font-heading font-semibold text-lg text-dark mb-6">Calculate Times</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-dark">What do you want to calculate?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setMode('wake')} className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${mode === 'wake' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                        <Sun size={24} className="mb-2" />
                        <span className="text-xs sm:text-sm font-semibold">When to go to bed</span>
                      </button>
                      <button type="button" onClick={() => setMode('bed')} className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${mode === 'bed' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-surface border-transparent text-text-secondary hover:bg-surface-alt'}`}>
                        <Moon size={24} className="mb-2" />
                        <span className="text-xs sm:text-sm font-semibold">When to wake up</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-dark">
                      {mode === 'wake' ? 'I want to wake up at:' : 'I plan to go to bed at:'}
                    </label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        required 
                        type="time" 
                        value={time} 
                        onChange={e => setTime(e.target.value)} 
                        className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-dark font-display text-lg" 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-xl bg-indigo-600 text-white font-heading font-bold hover:bg-indigo-700 transition-colors shadow-sm text-base sm:text-lg">
                  Calculate Cycles
                </button>
              </form>
              
              <div className="mt-6 p-5 bg-surface rounded-2xl border border-border text-xs sm:text-sm text-text-secondary leading-relaxed">
                <p className="mb-2"><strong className="text-dark">Did you know?</strong> A good night&apos;s sleep consists of 5-6 complete sleep cycles. Each cycle lasts about 90 minutes.</p>
                <p>Waking up in the middle of a cycle leaves you feeling groggy, but waking up <em>between</em> cycles lets you wake up naturally refreshed.</p>
                <p className="mt-2 text-xs italic opacity-80">*This calculator factors in an average of 15 minutes to fall asleep.</p>
              </div>
            </div>

            {/* Results Column */}
            <div>
              {results.length > 0 ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-indigo-500" />
                    <h3 className="font-heading font-bold text-xl text-dark">Recommended Times</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary mb-6">
                    {mode === 'wake' ? 'To wake up refreshed, try getting into bed at one of these times:' : 'If you go to bed at this time, try setting your alarm for one of these times:'}
                  </p>
                  
                  <div className="space-y-3">
                    {results.map((res, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${index === 0 ? 'bg-indigo-50/80 border-indigo-200 shadow-xs' : index === 1 ? 'bg-surface border-border' : 'bg-surface/50 border-transparent opacity-85'}`}
                      >
                        <div>
                          <div className={`font-display text-2xl sm:text-3xl ${index === 0 ? 'text-indigo-700 font-bold' : 'text-dark'}`}>
                            {res.time}
                          </div>
                          <div className="text-xs text-text-muted font-medium mt-1">
                            {res.cycles} cycles ({res.hours} hours of sleep)
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0">
                            Optimal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center h-full min-h-[380px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                    <Moon size={32} className="text-indigo-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-text-secondary mb-2">Ready to calculate</h3>
                  <p className="text-xs sm:text-sm text-text-muted max-w-[260px]">Enter your target time and tap Calculate to reveal your 90-minute circadian windows.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Rail: Sleep Science & Clinical Reference (4 Columns on desktop) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
            <div className="flex items-center gap-2.5 text-indigo-900 font-heading font-bold text-sm mb-3">
              <Sparkles size={16} className="text-indigo-600" />
              <span>Sleep Architecture 101</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Human sleep alternates through 4 stages: Light (N1 & N2), Deep Slow-Wave (N3), and Rapid Eye Movement (REM).
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="font-bold text-indigo-900 block mb-0.5">Stages 1 & 2 (Light)</span>
                <span className="text-text-muted">Heart rate slows, core body temp decreases. Body prepares for deep recovery.</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <span className="font-bold text-indigo-800 block mb-0.5">Stage 3 (Deep NREM)</span>
                <span className="text-indigo-950/80">Cellular repair, tissue growth, immune booster, and human growth hormone release.</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="font-bold text-purple-800 block mb-0.5">Stage 4 (REM Sleep)</span>
                <span className="text-purple-950/80">Active brain processing, memory consolidation, creative synthesis, and emotional balance.</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1A2E1A] to-[#0D1F0D] text-white rounded-3xl p-6 shadow-md border border-primary/20">
            <h4 className="font-display text-lg text-white mb-2">3 Rules for Deep Rest</h4>
            <ul className="space-y-2.5 text-xs text-white/85">
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span>Dim blue and overhead lighting 90 minutes before your planned bedtime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span>Keep bedroom temperature between 18°C and 20°C (65°F to 68°F).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span>Avoid caffeine within 8 hours of sleep to protect slow-wave cycles.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
