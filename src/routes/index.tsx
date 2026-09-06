import { createFileRoute, Link } from "@tanstack/react-router";
import { MdMic, MdChat, MdShield, MdTranslate, MdMenu, MdClose } from "react-icons/md";
import { FaHeartbeat, FaBrain, FaArrowRight, FaCheck, FaStar, FaQuoteLeft } from "react-icons/fa";
import { IoStatsChart, IoSparkles } from "react-icons/io5";
import { HiLightningBolt, HiSparkles } from "react-icons/hi";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindTalk AI — Your AI Health Companion" },
      {
        name: "description",
        content: "Talk about how you feel. Track your mood, symptoms, and meals in English, Twi, or Dagbani — powered by AI.",
      },
      { property: "og:title", content: "MindTalk AI — Your AI Health Companion" },
      { property: "og:description", content: "Voice logging, mood tracking, brain games and AI wellness guidance in your language." },
    ],
  }),
  component: Landing,
});

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */

const theme = {
  colors: {
    bg: "#0A0118",
    bgLight: "#13082A",
    primary: "#00FFD1",
    primaryDim: "rgba(0, 255, 209, 0.15)",
    secondary: "#A855F7",
    accent: "#F472B6",
    success: "#10B981",
    text: "#FFFFFF",
    textDim: "rgba(255, 255, 255, 0.7)",
    textMuted: "rgba(255, 255, 255, 0.5)",
    border: "rgba(255, 255, 255, 0.1)",
    glass: "rgba(255, 255, 255, 0.05)",
  },
  gradient: {
    primary: "linear-gradient(135deg, #00FFD1 0%, #A855F7 100%)",
    bg: "linear-gradient(180deg, #0A0118 0%, #13082A 50%, #1D0F40 100%)",
  },
};

const FEATURES = [
  {
    icon: MdMic,
    title: "Voice Check-ins",
    description: "Speak naturally in your language. Instant transcription and AI-powered health analysis.",
    color: theme.colors.primary,
  },
  {
    icon: FaHeartbeat,
    title: "Smart Body Map",
    description: "Interactive body visualization with targeted metrics and symptom tracking by region.",
    color: theme.colors.accent,
  },
  {
    icon: IoStatsChart,
    title: "Symptom Tracker",
    description: "Log symptoms with details. Spot patterns and trends with intelligent analytics.",
    color: theme.colors.secondary,
  },
  {
    icon: MdChat,
    title: "AI Wellness Coach",
    description: "Conversational AI that listens and provides personalized wellness guidance.",
    color: theme.colors.primary,
  },
  {
    icon: FaBrain,
    title: "Brain Boost Games",
    description: "Memory, math, and pattern games to sharpen focus and cognitive resilience.",
    color: theme.colors.secondary,
  },
  {
    icon: MdShield,
    title: "Privacy-First",
    description: "End-to-end encryption. Your data stays yours — never shared or sold.",
    color: theme.colors.success,
  },
];

const STEPS = [
  {
    number: "01",
    icon: MdMic,
    title: "Record Your Check-in",
    description: "Hit record and speak naturally about how you feel, what you ate, or any symptoms.",
    color: theme.colors.primary,
  },
  {
    number: "02",
    icon: HiSparkles,
    title: "AI Analyzes Everything",
    description: "Advanced AI extracts symptoms, mood indicators, and patterns from your voice.",
    color: theme.colors.secondary,
  },
  {
    number: "03",
    icon: IoStatsChart,
    title: "Track Your Progress",
    description: "View insights on your dashboard with charts, trends, and personalized recommendations.",
    color: theme.colors.accent,
  },
];

const TESTIMONIALS = [
  {
    name: "Ama K.",
    role: "Speaks Twi",
    quote: "I can finally record my health in Twi and get real insights. This app truly understands me and my needs.",
    avatar: "A",
  },
  {
    name: "David O.",
    role: "Speaks English",
    quote: "The voice logging saves me so much time. I just talk and everything is automatically tracked for me.",
    avatar: "D",
  },
  {
    name: "Faiza A.",
    role: "Speaks Dagbani",
    quote: "Being able to speak Dagbani and have the AI understand is incredible. Truly built for our community.",
    avatar: "F",
  },
];

const LANGUAGES = [
  "English", "Twi", "Dagbani", "Ewe", "Ga", "Fante",
  "Gurene", "Kusaal", "Nzema", "Gonja", "Ikposo", "Kasem",
];

const PLAN_FEATURES = [
  "Unlimited voice check-ins",
  "AI health insights & analysis",
  "Symptom & mood tracking",
  "Interactive body map",
  "Brain boost cognitive games",
  "13+ language support",
  "Private & encrypted data",
  "Emergency contacts",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: theme.gradient.bg, minHeight: "100vh", color: theme.colors.text }}>
      
      {/* ═══ NAVIGATION ═══ */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" 
        style={{ background: "rgba(10, 1, 24, 0.85)", borderColor: theme.colors.border }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="MindTalk AI" 
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10" />
              <span className="text-lg font-bold">MindTalk AI</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium transition-colors hover:text-white" 
                style={{ color: theme.colors.textDim }}>Features</a>
              <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-white" 
                style={{ color: theme.colors.textDim }}>How It Works</a>
              <a href="#languages" className="text-sm font-medium transition-colors hover:text-white" 
                style={{ color: theme.colors.textDim }}>Languages</a>
              <a href="#pricing" className="text-sm font-medium transition-colors hover:text-white" 
                style={{ color: theme.colors.textDim }}>Pricing</a>
              <Link to="/auth" 
                className="rounded-full px-6 py-2.5 text-sm font-bold transition-all hover:scale-105"
                style={{ background: theme.colors.primary, color: theme.colors.bg }}>
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} 
              className="rounded-lg p-2 transition-colors hover:bg-white/5 md:hidden">
              {menuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="border-t py-4 md:hidden" style={{ borderColor: theme.colors.border }}>
              <div className="flex flex-col gap-4">
                <a href="#features" onClick={() => setMenuOpen(false)} 
                  className="text-sm font-medium">Features</a>
                <a href="#how-it-works" onClick={() => setMenuOpen(false)} 
                  className="text-sm font-medium">How It Works</a>
                <a href="#languages" onClick={() => setMenuOpen(false)} 
                  className="text-sm font-medium">Languages</a>
                <a href="#pricing" onClick={() => setMenuOpen(false)} 
                  className="text-sm font-medium">Pricing</a>
                <Link to="/auth" onClick={() => setMenuOpen(false)}
                  className="rounded-full px-6 py-3 text-center text-sm font-bold"
                  style={{ background: theme.colors.primary, color: theme.colors.bg }}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden px-6 py-24 lg:py-32">
        
        {/* Background Blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
            style={{ background: theme.colors.secondary }} />
          <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
            style={{ background: theme.colors.primary }} />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider"
                style={{ background: theme.colors.primaryDim, border: `1px solid ${theme.colors.primary}40` }}>
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-75"
                    style={{ background: theme.colors.primary }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: theme.colors.primary }} />
                </span>
                AI-Powered Health Companion
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                Your Health,<br />
                <span style={{
                  background: theme.gradient.primary,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Your Voice
                </span>
              </h1>

              {/* Description */}
              <p className="mb-10 text-lg leading-relaxed sm:text-xl" style={{ color: theme.colors.textDim }}>
                Talk about how you feel. Track your mood, symptoms, and wellness in{" "}
                <strong className="font-semibold text-white">English</strong>,{" "}
                <strong className="font-semibold text-white">Twi</strong>, or{" "}
                <strong className="font-semibold text-white">Dagbani</strong>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link to="/auth"
                  className="group inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-base font-bold shadow-xl transition-all hover:scale-105"
                  style={{ background: theme.colors.primary, color: theme.colors.bg, boxShadow: `0 0 40px ${theme.colors.primary}40` }}>
                  Try MindTalk AI Free
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
                </Link>
                <a href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all hover:bg-white/5"
                  style={{ border: `2px solid ${theme.colors.border}` }}>
                  Learn More
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:justify-start"
                style={{ color: theme.colors.textMuted }}>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: theme.colors.primaryDim }}>
                    <MdShield size={16} style={{ color: theme.colors.primary }} />
                  </div>
                  Private & Encrypted
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: theme.colors.primaryDim }}>
                    <MdTranslate size={16} style={{ color: theme.colors.primary }} />
                  </div>
                  13+ Languages
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: theme.colors.primaryDim }}>
                    <HiLightningBolt size={16} style={{ color: theme.colors.primary }} />
                  </div>
                  AI Powered
                </div>
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                
                {/* Main Circle */}
                <div className="relative flex h-[400px] w-[400px] items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${theme.colors.glass}, transparent)`,
                    border: `1px solid ${theme.colors.border}`,
                  }}>
                  
                  {/* Center Icon */}
                  <div className="flex h-32 w-32 items-center justify-center rounded-full"
                    style={{
                      background: theme.colors.primary,
                      boxShadow: `0 0 60px ${theme.colors.primary}60`,
                    }}>
                    <MdChat size={64} style={{ color: theme.colors.bg }} />
                  </div>

                  {/* Floating Icons */}
                  <FloatingIcon icon={MdMic} color={theme.colors.primary} 
                    position="top-6 left-6" delay="0s" />
                  <FloatingIcon icon={FaHeartbeat} color={theme.colors.accent} 
                    position="top-6 right-6" delay="0.7s" />
                  <FloatingIcon icon={FaBrain} color={theme.colors.secondary} 
                    position="bottom-6 left-6" delay="1.4s" />
                  <FloatingIcon icon={IoStatsChart} color={theme.colors.primary} 
                    position="bottom-6 right-6" delay="2.1s" />
                </div>

                {/* Pulse Rings */}
                <div className="absolute inset-0 animate-ping rounded-full opacity-20"
                  style={{ border: `2px solid ${theme.colors.primary}`, animationDuration: "3s" }} />
                <div className="absolute inset-8 animate-ping rounded-full opacity-20"
                  style={{ border: `2px solid ${theme.colors.secondary}`, animationDuration: "3s", animationDelay: "1s" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="border-y py-12" 
        style={{ borderColor: theme.colors.border, background: theme.colors.glass }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard value="13+" label="Languages Supported" />
            <StatCard value="100%" label="Private & Secure" />
            <StatCard value="24/7" label="AI Available" />
            <StatCard value="Free" label="To Get Started" />
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section id="features" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: theme.colors.primaryDim, color: theme.colors.primary }}>
              <HiSparkles size={14} />
              Features
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
              Everything You Need for{" "}
              <span style={{
                background: theme.gradient.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Better Health
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed" style={{ color: theme.colors.textDim }}>
              Voice logging, AI analysis, mood tracking, and brain games — all in one private, multilingual platform designed for your wellness journey.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: theme.colors.primaryDim, color: theme.colors.primary }}>
              <IoSparkles size={14} />
              How It Works
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl">
              Three Simple Steps to{" "}
              <span style={{
                background: theme.gradient.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Better Wellness
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: theme.colors.textDim }}>
              Start tracking your health in minutes with our intuitive voice-first platform
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <StepCard key={step.number} {...step} isLast={index === STEPS.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: theme.colors.primaryDim, color: theme.colors.primary }}>
              <FaStar size={12} />
              Testimonials
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl">
              Trusted by Users{" "}
              <span style={{
                background: theme.gradient.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Across Languages
              </span>
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LANGUAGES SECTION ═══ */}
      <section id="languages" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl p-12 lg:p-16"
            style={{ background: theme.colors.glass, border: `1px solid ${theme.colors.border}` }}>
            
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ background: theme.colors.primaryDim, color: theme.colors.primary }}>
                <MdTranslate size={14} />
                Languages
              </div>
              <h2 className="mb-4 text-4xl font-black sm:text-5xl">
                Speak Your{" "}
                <span style={{
                  background: theme.gradient.primary,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Language
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg" style={{ color: theme.colors.textDim }}>
                MindTalk AI supports 13+ languages including Ghanaian local languages, powered by Khaya AI for accurate transcription
              </p>
            </div>

            {/* Languages Grid */}
            <div className="flex flex-wrap justify-center gap-3">
              {LANGUAGES.map((lang) => (
                <span key={lang}
                  className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: theme.colors.primaryDim,
                    border: `1px solid ${theme.colors.primary}40`,
                    color: theme.colors.primary,
                  }}>
                  {lang}
                </span>
              ))}
              <span className="rounded-full px-6 py-2.5 text-sm font-semibold"
                style={{ background: theme.colors.glass, color: theme.colors.textMuted }}>
                + more coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING SECTION ═══ */}
      <section id="pricing" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: theme.colors.primaryDim, color: theme.colors.primary }}>
              <FaCheck size={12} />
              Pricing
            </div>
            <h2 className="mb-6 text-4xl font-black sm:text-5xl">
              Simple,{" "}
              <span style={{
                background: theme.gradient.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Transparent
              </span>
              {" "}Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: theme.colors.textDim }}>
              No credit card required. No hidden fees. Start for free today.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="mx-auto max-w-lg rounded-3xl p-10 lg:p-12"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primaryDim}, ${theme.colors.glass})`,
              border: `1px solid ${theme.colors.borderBright}`,
              boxShadow: theme.shadow.card,
            }}>
            
            {/* Price Header */}
            <div className="mb-8 text-center">
              <div className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase"
                style={{ background: theme.colors.primary, color: theme.colors.bg }}>
                Free Forever
              </div>
              <div className="mb-2">
                <span className="text-7xl font-black">$0</span>
                <span className="text-2xl font-bold" style={{ color: theme.colors.textDim }}> / month</span>
              </div>
              <p className="text-base" style={{ color: theme.colors.textDim }}>
                Everything included, no limits
              </p>
            </div>

            {/* Features List */}
            <ul className="mb-10 space-y-4">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: theme.colors.primary }}>
                    <FaCheck size={12} style={{ color: theme.colors.bg }} />
                  </div>
                  <span className="text-base">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link to="/auth"
              className="block w-full rounded-full py-4 text-center text-lg font-bold transition-all hover:scale-105"
              style={{
                background: theme.colors.primary,
                color: theme.colors.bg,
                boxShadow: theme.shadow.glow,
              }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl p-12 text-center lg:p-16"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.glass}, transparent)`,
            border: `1px solid ${theme.colors.border}`,
          }}>
          <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
            Ready to Start Your{" "}
            <span style={{
              background: theme.gradient.primary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Wellness Journey?
            </span>
          </h2>
          <p className="mb-10 text-lg" style={{ color: theme.colors.textDim }}>
            Join thousands using MindTalk AI to track their health in their own language
          </p>
          <Link to="/auth"
            className="group inline-flex items-center gap-3 rounded-full px-10 py-5 text-lg font-bold transition-all hover:scale-105"
            style={{
              background: theme.colors.primary,
              color: theme.colors.bg,
              boxShadow: theme.shadow.glowLarge,
            }}>
            Get Started Free
            <FaArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t px-6 py-12" 
        style={{ borderColor: theme.colors.border, background: theme.colors.bgLight }}>
        <div className="mx-auto max-w-7xl">
          
          {/* Top Row */}
          <div className="mb-10 flex flex-col items-center justify-between gap-8 md:flex-row">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="MindTalk AI" 
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10" />
              <div>
                <div className="text-lg font-bold">MindTalk AI</div>
                <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                  Your AI Health Companion
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#features" className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: theme.colors.textDim }}>Features</a>
              <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: theme.colors.textDim }}>How It Works</a>
              <a href="#languages" className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: theme.colors.textDim }}>Languages</a>
              <a href="#pricing" className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: theme.colors.textDim }}>Pricing</a>
              <Link to="/auth" className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: theme.colors.textDim }}>Sign In</Link>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="border-t pt-8 text-center" style={{ borderColor: theme.colors.border }}>
            <p className="mb-2 text-sm" style={{ color: theme.colors.textMuted }}>
              MindTalk AI is for informational and wellness purposes only. Not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-sm" style={{ color: theme.colors.textMuted }}>
              © 2026 MindTalk AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FloatingIcon({ icon: Icon, color, position, delay }: {
  icon: any; color: string; position: string; delay: string;
}) {
  return (
    <div
      className={`absolute ${position} flex h-16 w-16 items-center justify-center rounded-full`}
      style={{
        background: theme.colors.glass,
        border: `1px solid ${theme.colors.border}`,
        animation: "float 3s ease-in-out infinite",
        animationDelay: delay,
      }}>
      <Icon size={28} style={{ color }} />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-2 text-5xl font-black" style={{ color: theme.colors.primary }}>
        {value}
      </div>
      <div className="text-sm font-medium" style={{ color: theme.colors.textMuted }}>
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: {
  icon: any; title: string; description: string; color: string;
}) {
  return (
    <div
      className="group rounded-3xl p-8 transition-all hover:scale-[1.02]"
      style={{
        background: theme.colors.glass,
        border: `1px solid ${theme.colors.border}`,
      }}>
      
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
        }}>
        <Icon size={32} style={{ color }} />
      </div>

      {/* Content */}
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="leading-relaxed" style={{ color: theme.colors.textDim }}>
        {description}
      </p>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, description, color, isLast }: {
  number: string; icon: any; title: string; description: string; color: string; isLast: boolean;
}) {
  return (
    <div className="relative">
      <div className="rounded-3xl p-8 text-center"
        style={{
          background: theme.colors.glass,
          border: `1px solid ${theme.colors.border}`,
        }}>
        
        {/* Icon Circle */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: `${color}20`,
            border: `2px solid ${color}`,
          }}>
          <Icon size={36} style={{ color }} />
        </div>

        {/* Step Number */}
        <div className="mb-2 text-sm font-bold" style={{ color }}>
          STEP {number}
        </div>

        {/* Title */}
        <h3 className="mb-4 text-xl font-bold">{title}</h3>

        {/* Description */}
        <p className="leading-relaxed" style={{ color: theme.colors.textDim }}>
          {description}
        </p>
      </div>

      {/* Connector Arrow (desktop only) */}
      {!isLast && (
        <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
          <FaArrowRight size={24} style={{ color: theme.colors.border }} />
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ name, role, quote, avatar }: {
  name: string; role: string; quote: string; avatar: string;
}) {
  return (
    <div className="rounded-3xl p-8"
      style={{
        background: theme.colors.glass,
        border: `1px solid ${theme.colors.border}`,
      }}>
      
      {/* Quote Icon */}
      <FaQuoteLeft size={28} className="mb-6" style={{ color: theme.colors.primary, opacity: 0.5 }} />

      {/* Quote */}
      <p className="mb-6 leading-relaxed" style={{ color: theme.colors.textDim }}>
        "{quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 border-t pt-6" style={{ borderColor: theme.colors.border }}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold"
          style={{ background: theme.colors.primaryDim, color: theme.colors.primary }}>
          {avatar}
        </div>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-sm" style={{ color: theme.colors.textMuted }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// Inject float animation
if (typeof document !== "undefined" && !document.querySelector("#landing-animations")) {
  const style = document.createElement("style");
  style.id = "landing-animations";
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
  `;
  document.head.appendChild(style);
}
