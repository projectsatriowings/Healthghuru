'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage('Invalid admin email or password.');
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@healthghuru.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <Link href="/" className="text-text-secondary hover:text-dark transition-colors flex items-center gap-2 font-medium text-sm">
          <ArrowLeft size={16} /> Back to Homepage
        </Link>
      </div>
      
      <ScrollReveal variant="scaleUp" className="w-full max-w-[440px]">
        <div className="bg-white rounded-[20px] shadow-2xl border border-primary/10 p-8 sm:p-10 relative overflow-hidden">
          
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-accent" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link
              href="/"
              className="transition-transform hover:scale-105 outline-none focus:outline-none focus:ring-0 border-0"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              <div
                className="relative w-48 h-20 outline-none border-0"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                <Image
                  src="/images/logo_transparent.png"
                  alt="HealthGhuru Logo"
                  fill
                  className="object-contain outline-none border-0"
                  style={{ outline: 'none', border: 'none' }}
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-accent/10 p-3 rounded-full text-accent">
                <Shield size={24} />
              </div>
            </div>
            <h2 className="font-display text-3xl text-dark mb-2">Admin Portal</h2>
            <p className="text-text-secondary text-sm">Sign in to manage HealthGhuru</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-100 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-muted uppercase mb-1">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@healthghuru.com"
                className="block w-full px-4 py-3 text-dark bg-surface-alt border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-muted uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 pr-11 text-dark bg-surface-alt border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-dark transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full mt-2 relative"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Signing in...
                </span>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="text-xs text-accent hover:underline font-medium"
            >
              Fill Demo Admin Credentials
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-center text-xs text-text-muted uppercase tracking-wider font-semibold">
              Restricted Area
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
