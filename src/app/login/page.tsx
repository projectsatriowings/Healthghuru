"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Check,
  HeartPulse,
  BookOpen,
  Activity,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") as AuthMode;
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<AuthMode>(
    tokenParam ? "reset" : initialTab === "signup" ? "signup" : "signin"
  );

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(tokenParam);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedResetUrl, setGeneratedResetUrl] = useState<string | null>(null);

  // Sync token from URL if present
  useEffect(() => {
    if (tokenParam) {
      setResetToken(tokenParam);
      setMode("reset");
    }
  }, [tokenParam]);

  // Password strength calculations for signup
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-400", "bg-amber-400", "bg-blue-400", "bg-primary"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setGeneratedResetUrl(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!acceptTerms) {
          throw new Error("Please accept the Terms of Service and Privacy Policy to continue.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match. Please verify your password.");
        }

        // Call registration API
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            subscribeNewsletter: newsletter,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create account.");
        }

        setSuccessMessage("Account created successfully! Signing you in...");

        // Auto sign-in
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (signInRes?.error) {
          setMode("signin");
          setSuccessMessage("Account created! Please sign in with your credentials.");
        } else {
          router.push("/onboarding");
          router.refresh();
        }
      } else if (mode === "signin") {
        // Sign-in flow
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (result?.error) {
          if (result.error.includes("suspended")) {
            setErrorMessage("This account has been temporarily suspended. Please contact support.");
          } else {
            setErrorMessage("Invalid email or password. Please check your credentials and try again.");
          }
        } else {
          setSuccessMessage("Signed in successfully! Redirecting...");
          router.push(callbackUrl);
          router.refresh();
        }
      } else if (mode === "forgot") {
        // Forgot password flow
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to process password reset request.");
        }

        setSuccessMessage(data.message || "Reset link generated.");
        if (data.resetUrl) {
          setGeneratedResetUrl(data.resetUrl);
        }
      } else if (mode === "reset") {
        // Reset password flow
        if (password.length < 6) {
          throw new Error("New password must be at least 6 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetToken,
            newPassword: password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update password.");
        }

        setSuccessMessage("Password updated successfully! You can now sign in.");
        setTimeout(() => {
          setMode("signin");
          setPassword("");
          setConfirmPassword("");
          setErrorMessage("");
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambience & Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="site-container py-5 sm:py-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-all text-xs sm:text-sm font-heading font-semibold group"
        >
          <span className="w-8 h-8 rounded-full bg-white shadow-2xs border border-primary/15 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all text-primary">
            <ArrowLeft size={16} />
          </span>
          <span>Back to HealthGuru</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-heading font-medium text-text-secondary bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-primary/15 shadow-2xs">
          <ShieldCheck size={15} className="text-primary" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="site-container my-auto py-6 sm:py-10 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Brand Story & Trust Showcase (Visible on lg+) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8"
          >
            <div>
              <Link href="/" className="inline-block relative w-52 h-14 mb-6">
                <Image
                  src="/images/logo_transparent.png"
                  alt="HealthGuru Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </Link>

              <h2 className="font-display text-3xl xl:text-4xl text-dark leading-tight mb-4">
                Your Evidence-Based Wellness Companion
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Join our community of over 50,000+ members discovering personalized health intelligence, curated medical insights, and verified nutrition protocols.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-primary/10 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                    Tailored Content Engine
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Select topics like Nutrition, Fitness, and Sleep to receive custom articles and video feeds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-primary/10 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                    Save & Sync Anywhere
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Bookmark long-form articles, clinical digests, and shorts for seamless offline or later reading.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-primary/10 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs text-dark uppercase tracking-wider">
                    Evidence-Based Trust
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Content reviewed by clinical professionals and backed by leading health authorities.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Quote */}
            <div className="p-4 rounded-2xl bg-primary text-white relative overflow-hidden shadow-md">
              <div className="relative z-10">
                <p className="text-xs font-serif italic leading-relaxed text-white/95">
                  &ldquo;Health is not about perfection, but daily consistent choices grounded in science.&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-heading font-semibold text-white/80">
                  <span>Dr. Sarah Jenkins</span>
                  <span>·</span>
                  <span>HealthGuru Editorial Board</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:col-span-7 max-w-lg mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-primary/15 p-6 sm:p-10 relative overflow-hidden">
              
              {/* Top Gradient Ribbon Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

              {/* Mobile-only Header Logo */}
              <div className="lg:hidden text-center mb-6">
                <Link href="/" className="inline-block relative w-44 h-12 mb-2">
                  <Image
                    src="/images/logo_transparent.png"
                    alt="HealthGuru Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </Link>
              </div>

              {/* Tab Navigation (Sign In vs Sign Up) */}
              {(mode === "signin" || mode === "signup") && (
                <div className="flex bg-surface p-1.5 rounded-2xl border border-primary/15 mb-6 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-heading font-semibold rounded-xl transition-all relative z-10 ${
                      mode === "signin" ? "text-white shadow-xs" : "text-text-primary hover:text-primary"
                    }`}
                  >
                    {mode === "signin" && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-primary rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-heading font-semibold rounded-xl transition-all relative z-10 ${
                      mode === "signup" ? "text-white shadow-xs" : "text-text-primary hover:text-primary"
                    }`}
                  >
                    {mode === "signup" && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-primary rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Create Account</span>
                  </button>
                </div>
              )}

              {/* Card Title & Description */}
              <div className="mb-6">
                <h1 className="font-display text-2xl sm:text-3xl text-dark">
                  {mode === "signin" && "Welcome Back"}
                  {mode === "signup" && "Create Your Account"}
                  {mode === "forgot" && "Reset Your Password"}
                  {mode === "reset" && "Set a New Password"}
                </h1>
                <p className="text-text-secondary text-xs sm:text-sm mt-1 font-body">
                  {mode === "signin" && "Sign in to access your personalized feed and saved wellness content."}
                  {mode === "signup" && "Join thousands of members taking control of their wellness journey."}
                  {mode === "forgot" && "Enter your email address and we'll help you regain access."}
                  {mode === "reset" && "Choose a secure password of at least 6 characters."}
                </p>
              </div>

              {/* Status Notifications */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5"
                  >
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-primary text-xs font-medium flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p>{successMessage}</p>
                      {generatedResetUrl && (
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              router.push(generatedResetUrl);
                            }}
                            className="inline-flex items-center gap-1.5 font-bold text-xs text-primary underline hover:text-primary-dark"
                          >
                            Click here to proceed to password reset &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name (Sign Up Only) */}
                <AnimatePresence>
                  {mode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Address (Sign In, Sign Up, Forgot) */}
                {mode !== "reset" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input (Sign In, Sign Up, Reset) */}
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                        {mode === "reset" ? "New Password" : "Password"}
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-surface border border-border rounded-xl text-sm text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-dark transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Meter (Signup / Reset) */}
                    {(mode === "signup" || mode === "reset") && password.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-text-muted">
                          <span>Password Strength:</span>
                          <span className="font-semibold text-dark">
                            {strengthLabels[passwordScore - 1] || "Too short"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordScore >= step ? strengthColors[passwordScore - 1] : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Password (Sign Up & Reset) */}
                {(mode === "signup" || mode === "reset") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-surface border border-border rounded-xl text-sm text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-dark transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Remember Me Checkbox (Sign In) */}
                {mode === "signin" && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                      />
                      <span>Remember this browser for 30 days</span>
                    </label>
                  </div>
                )}

                {/* Terms and Newsletter Checkboxes (Sign Up) */}
                {mode === "signup" && (
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-text-secondary leading-tight">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/30 accent-primary shrink-0 cursor-pointer"
                      />
                      <span>
                        I accept the{" "}
                        <Link href="/terms" target="_blank" className="text-primary font-semibold hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" target="_blank" className="text-primary font-semibold hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-text-secondary leading-tight">
                      <input
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/30 accent-primary shrink-0 cursor-pointer"
                      />
                      <span>Send me evidence-based health digests & weekly wellness tips.</span>
                    </label>
                  </div>
                )}

                {/* Submit Action Button */}
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg py-3.5 text-sm font-heading font-bold"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" && "Sign In to HealthGuru"}
                      {mode === "signup" && "Create Free HealthGuru Account"}
                      {mode === "forgot" && "Send Password Reset Link"}
                      {mode === "reset" && "Update Password & Sign In"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Mode Switchers */}
              <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
                {mode === "signin" && (
                  <p className="text-xs text-text-secondary">
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="font-heading font-bold text-primary hover:underline ml-1"
                    >
                      Sign Up for Free
                    </button>
                  </p>
                )}

                {mode === "signup" && (
                  <p className="text-xs text-text-secondary">
                    Already have a HealthGuru account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="font-heading font-bold text-primary hover:underline ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                )}

                {(mode === "forgot" || mode === "reset") && (
                  <p className="text-xs text-text-secondary">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="font-heading font-bold text-primary hover:underline ml-1"
                    >
                      Back to Sign In
                    </button>
                  </p>
                )}
              </div>

            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="site-container py-5 text-center text-xs text-text-muted relative z-10 border-t border-primary/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
          <span>© {new Date().getFullYear()} HealthGuru Media Platform. All rights reserved.</span>
          <div className="flex items-center gap-4 text-text-secondary">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-primary transition-colors">Editorial Standards</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
