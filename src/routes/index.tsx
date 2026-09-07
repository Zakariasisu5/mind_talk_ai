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
    borderBright: "rgba(255, 255, 255, 0.15)",
    glass: "rgba(255, 255, 255, 0.05)",
  },
  gradient: {
    primary: "linear-gradient(135deg, #00FFD1 0%, #A855F7 100%)",
    bg: "linear-gradient(180deg, #0A0118 0%, #13082A 50%, #1D0F40 100%)",
  },
  shadow: {
    card: "0 4px 24px rgba(0, 0, 0, 0.2)",
    glow: "0 0 40px rgba(0, 255, 209, 0.3)",
    glowLarge: "0 0 60px rgba(0, 255, 209, 0.4)",
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
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useState(() => {
    if (typeof window === "undefined") return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <div style={{ background: theme.gradient.bg, minHeight: "100vh", color: theme.colors.text }}>
      
      {/* ═══ NAVIGATION ═══ */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" 
        style={{ 
          background: scrolled ? "rgba(10, 1, 24, 0.95)" : "rgba(10, 1, 24, 0.80)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${scrolled ? "rgba(0, 255, 209, 0.2)" : theme.colors.border}`,
          boxShadow: scrolled ? "0 4px 24px rgba(0, 0, 0, 0.3)" : "none",
        }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-2.5 sm:gap-3 transition-transform hover:scale-105">
              <div className="relative">
                <img 
                  src="/logo.jpeg" 
                  alt="MindTalk AI" 
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover transition-all" 
                  style={{ 
                    boxShadow: scrolled 
                      ? `0 0 20px ${theme.colors.primary}40` 
                      : `0 0 0px ${theme.colors.primary}40`,
                  }}
                />
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ boxShadow: `0 0 30px ${theme.colors.primary}60` }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold leading-none">MindTalk AI</span>
                <span className="hidden sm:block text-[10px] font-medium leading-none mt-0.5" 
                  style={{ color: theme.colors.textMuted }}>
                  Health Companion
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#languages">Languages</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
            </div>

            {/* Desktop CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Desktop CTA */}
              <Link 
                to="/auth" 
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
                style={{ 
                  background: theme.colors.primary, 
                  color: theme.colors.bg,
                  boxShadow: `0 0 20px ${theme.colors.primary}30`,
                }}>
                <span>Get Started</span>
                <FaArrowRight size={12} />
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="inline-flex lg:hidden items-center justify-center rounded-xl p-2 transition-all hover:bg-white/5 active:scale-95"
                style={{ border: menuOpen ? `1px solid ${theme.colors.primary}` : "1px solid transparent" }}
                aria-label="Toggle menu">
                {menuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div 
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}>
            <div 
              className="py-4 space-y-1 border-t" 
              style={{ borderColor: theme.colors.border }}>
              <MobileNavLink href="#features" onClick={() => setMenuOpen(false)}>
                <IoSparkles size={18} />
                Features
              </MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setMenuOpen(false)}>
                <HiSparkles size={18} />
                How It Works
              </MobileNavLink>
              <MobileNavLink href="#languages" onClick={() => setMenuOpen(false)}>
                <MdTranslate size={18} />
                Languages
              </MobileNavLink>
              <MobileNavLink href="#pricing" onClick={() => setMenuOpen(false)}>
                <FaCheck size={16} />
                Pricing
              </MobileNavLink>
              
              {/* Mobile CTA */}
              <Link 
                to="/auth" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 mt-4 rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-95"
                style={{ background: theme.colors.primary, color: theme.colors.bg }}>
                Get Started Free
                <FaArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content jump */}
      <div className="h-16 sm:h-18" />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
        
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          {/* Animated gradient blobs */}
          <div 
            className="absolute left-1/4 -top-20 sm:top-0 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[600px] lg:w-[600px] rounded-full opacity-20 blur-[80px] sm:blur-[120px] animate-pulse"
            style={{ background: theme.colors.secondary, animationDuration: "4s" }} 
          />
          <div 
            className="absolute right-1/4 top-1/3 h-[250px] w-[250px] sm:h-[350px] sm:w-[350px] lg:h-[500px] lg:w-[500px] rounded-full opacity-20 blur-[80px] sm:blur-[100px] animate-pulse"
            style={{ background: theme.colors.primary, animationDuration: "5s", animationDelay: "1s" }} 
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* ─── Left: Content ─── */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              
              {/* Badge */}
              <div 
                className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                style={{ background: theme.colors.primaryDim, border: `1px solid ${theme.colors.primary}40` }}>
                <span className="flex h-2 w-2 relative">
                  <span 
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: theme.colors.primary }} 
                  />
                  <span 
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: theme.colors.primary }} 
                  />
                </span>
                <span className="hidden sm:inline">AI-Powered Health Companion</span>
                <span className="sm:hidden">AI Health Companion</span>
              </div>

              {/* Headline */}
              <h1 className="mb-4 sm:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                <span className="block">Your Health,</span>
                <span 
                  className="block"
                  style={{
                    background: theme.gradient.primary,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                  Your Voice
                </span>
              </h1>

              {/* Description */}
              <p 
                className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0" 
                style={{ color: theme.colors.textDim }}>
                Talk about how you feel. Track your mood, symptoms, and wellness in{" "}
                <strong className="font-semibold" style={{ color: theme.colors.text }}>English</strong>,{" "}
                <strong className="font-semibold" style={{ color: theme.colors.text }}>Twi</strong>, or{" "}
                <strong className="font-semibold" style={{ color: theme.colors.text }}>Dagbani</strong>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center lg:justify-start mb-8 sm:mb-12">
                <Link 
                  to="/auth"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                  style={{ 
                    background: theme.colors.primary, 
                    color: theme.colors.bg, 
                    boxShadow: `0 8px 32px ${theme.colors.primary}40` 
                  }}>
                  <span>Try MindTalk AI Free</span>
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" size={14} />
                </Link>
                <a 
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all hover:bg-white/5 active:scale-95"
                  style={{ border: `2px solid ${theme.colors.border}` }}>
                  <span>Learn More</span>
                  <IoSparkles size={16} />
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8">
                <TrustBadge icon={MdShield} text="Private & Encrypted" />
                <TrustBadge icon={MdTranslate} text="13+ Languages" />
                <TrustBadge icon={HiLightningBolt} text="AI Powered" />
              </div>
            </div>

            {/* ─── Right: Hero Visual ─── */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[450px]">
                
                {/* Main Circle */}
                <div 
                  className="relative flex aspect-square items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${theme.colors.glass}, transparent)`,
                    border: `1px solid ${theme.colors.border}`,
                  }}>
                  
                  {/* Center Icon */}
                  <div 
                    className="flex h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{
                      background: theme.colors.primary,
                      boxShadow: `0 0 40px ${theme.colors.primary}60, 0 0 80px ${theme.colors.primary}30`,
                    }}>
                    <MdChat className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16" style={{ color: theme.colors.bg }} />
                  </div>

                  {/* Floating Icons - Responsive Sizes */}
                  <FloatingIconResponsive 
                    icon={MdMic} 
                    color={theme.colors.primary} 
                    position="top-4 left-4 sm:top-6 sm:left-6" 
                    delay="0s" 
                  />
                  <FloatingIconResponsive 
                    icon={FaHeartbeat} 
                    color={theme.colors.accent} 
                    position="top-4 right-4 sm:top-6 sm:right-6" 
                    delay="0.7s" 
                  />
                  <FloatingIconResponsive 
                    icon={FaBrain} 
                    color={theme.colors.secondary} 
                    position="bottom-4 left-4 sm:bottom-6 sm:left-6" 
                    delay="1.4s" 
                  />
                  <FloatingIconResponsive 
                    icon={IoStatsChart} 
                    color={theme.colors.primary} 
                    position="bottom-4 right-4 sm:bottom-6 sm:right-6" 
                    delay="2.1s" 
                  />
                </div>

                {/* Pulse Rings - Responsive */}
                <div 
                  className="absolute inset-0 animate-ping rounded-full opacity-20"
                  style={{ border: `2px solid ${theme.colors.primary}`, animationDuration: "3s" }} 
                />
                <div 
                  className="absolute inset-4 sm:inset-8 animate-ping rounded-full opacity-20"
                  style={{ border: `2px solid ${theme.colors.secondary}`, animationDuration: "3s", animationDelay: "1.5s" }} 
                />
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

// Navigation Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="relative px-3 py-2 text-sm font-medium transition-all hover:text-white group"
      style={{ color: theme.colors.textDim }}>
      {children}
      <span 
        className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
        style={{ background: theme.colors.primary }}
      />
    </a>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ href, onClick, children }: { 
  href: string; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all hover:bg-white/5"
      style={{ color: theme.colors.text }}>
      {children}
    </a>
  );
}

// Trust Badge Component
function TrustBadge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: theme.colors.textMuted }}>
      <div 
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-transform hover:scale-110"
        style={{ background: theme.colors.primaryDim }}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.colors.primary }} />
      </div>
      <span className="hidden sm:inline">{text}</span>
      <span className="sm:hidden">{text.split(' ')[0]}</span>
    </div>
  );
}

// Responsive Floating Icon Component
function FloatingIconResponsive({ icon: Icon, color, position, delay }: {
  icon: any; color: string; position: string; delay: string;
}) {
  return (
    <div
      className={`absolute ${position} flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full transition-transform hover:scale-110`}
      style={{
        background: theme.colors.glass,
        border: `1px solid ${theme.colors.border}`,
        animation: "float 3s ease-in-out infinite",
        animationDelay: delay,
      }}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color }} />
    </div>
  );
}

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
