'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Stethoscope, Send, AlertTriangle, ShieldCheck, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SymptomCheckerPage() {
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Health Assistant. I can help answer general questions about wellness, nutrition, and common symptoms. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Simulate a typing effect
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Network error. Please check your connection.' }]);
    }
    
    setIsLoading(false);
  };

  // The Disclaimer Modal overlay
  if (!acceptedDisclaimer) {
    return (
      <div className="site-container py-12 flex justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl mt-10">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6 mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display text-2xl text-center text-dark mb-4">Medical Disclaimer</h2>
          <div className="text-sm text-text-secondary space-y-4 mb-8 bg-red-50 p-6 rounded-2xl border border-red-100">
            <p><strong>This tool does not provide medical advice.</strong></p>
            <p>The information, including but not limited to, text, graphics, images and other material provided by this AI Assistant are for informational purposes only.</p>
            <p>No material on this site is intended to be a substitute for professional medical advice, diagnosis or treatment. Always seek the advice of your physician or other qualified health care provider with any questions you may have regarding a medical condition.</p>
            <p>If you think you may have a medical emergency, call your doctor, go to the emergency department, or call emergency services immediately.</p>
          </div>
          <button 
            onClick={() => setAcceptedDisclaimer(true)}
            className="w-full py-4 rounded-xl bg-red-600 text-white font-heading font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-lg"
          >
            <ShieldCheck size={20} />
            I Understand and Agree
          </button>
          <Link href="/tools" className="block text-center mt-4 text-sm font-semibold text-text-muted hover:text-dark">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container-tool py-6 sm:py-8 h-[calc(100vh-90px)] min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Link href="/tools" className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Tools
        </Link>
        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <ShieldCheck size={12} /> AI Medical Assistant v2.4
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Chat Window (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3.5 p-4 sm:p-5 border-b border-border bg-white shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-[#ff8a57] flex items-center justify-center shadow-md shrink-0">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl text-dark">AI Health Assistant</h1>
              <p className="text-xs text-text-secondary">Powered by Evidence-Based Health Intelligence • <span className="text-red-500 font-semibold">Informational only</span></p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-surface/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gradient-to-br from-accent to-[#ff8a57] text-white'}`}>
                    {msg.role === 'user' ? <User size={15} /> : <Stethoscope size={15} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm shadow-sm' : 'bg-white border border-border text-dark rounded-tl-sm shadow-xs'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-accent to-[#ff8a57] text-white">
                    <Stethoscope size={15} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-border text-dark rounded-tl-sm shadow-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-white border-t border-border shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about symptoms, wellness routines, or dietary questions..."
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-dark transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Emergency & Companion Guidance (4 Columns on Desktop) */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col space-y-4 overflow-y-auto">
          {/* Emergency Alert Box */}
          <div className="bg-red-50/80 rounded-3xl p-5 border border-red-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-red-700 font-heading font-bold text-sm mb-2">
              <AlertTriangle size={17} />
              <span>Medical Emergency Notice</span>
            </div>
            <p className="text-xs text-red-900/80 leading-relaxed mb-3">
              If you are experiencing severe chest pain, shortness of breath, sudden numbness, or heavy bleeding, seek emergency care immediately.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-red-700">
              <span>Emergency Services: 911 / 112 / 108</span>
            </div>
          </div>

          {/* Quick Prompt Ideas */}
          <div className="bg-white rounded-3xl p-5 border border-border shadow-xs flex-1">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-dark mb-3">
              Popular Inquiries
            </h4>
            <div className="space-y-2">
              {[
                "What natural foods support immune resilience?",
                "How can I optimize slow-wave deep sleep?",
                "What are optimal daily protein intake targets?",
                "Natural techniques to reduce elevated cortisol"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="w-full text-left p-2.5 rounded-xl bg-surface hover:bg-primary/10 border border-border hover:border-primary/30 text-xs text-text-secondary hover:text-primary transition-all leading-snug"
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Educational Purpose Card */}
          <div className="bg-surface rounded-2xl p-4 border border-border text-[11px] text-text-muted leading-relaxed">
            <p className="flex items-center gap-1.5 font-semibold text-text-secondary mb-1">
              <ShieldCheck size={14} className="text-primary" /> Verified Educational Scope
            </p>
            Responses are generated using biomedical knowledge models for educational exploration and do not constitute clinical doctor-patient relationships.
          </div>
        </aside>
      </div>
    </div>
  );
}
