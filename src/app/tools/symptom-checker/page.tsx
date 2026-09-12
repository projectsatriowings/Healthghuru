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
    <div className="site-container py-8 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
      <Link href="/tools" className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-6 shrink-0">
        <ArrowLeft size={16} className="mr-2" /> Back to Tools
      </Link>
      
      <div className="flex items-center gap-4 mb-6 shrink-0 bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-[#ff8a57] flex items-center justify-center shadow-md">
          <Stethoscope size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl text-dark">AI Health Assistant</h1>
          <p className="text-xs text-text-secondary">Powered by AI • <span className="text-red-500 font-semibold">Not a substitute for professional medical advice</span></p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-surface border border-border rounded-t-3xl overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gradient-to-br from-accent to-[#ff8a57] text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Stethoscope size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-border text-dark rounded-tl-sm shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-accent to-[#ff8a57] text-white">
                  <Stethoscope size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-border text-dark rounded-tl-sm shadow-sm flex items-center gap-2">
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
        <div className="p-4 bg-white border-t border-border">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe your symptoms or ask a nutrition question..."
              className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 pr-14 outline-none focus:border-accent focus:ring-1 focus:ring-accent text-dark resize-none min-h-[52px] max-h-[120px]"
              rows={1}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2.5 rounded-lg bg-accent text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-text-muted">AI can make mistakes. For serious conditions, consult a doctor immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
