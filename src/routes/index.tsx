import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Brain, HeartPulse, MessageCircleHeart, Mic } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindTalk AI — your calm AI health companion" },
      {
        name: "description",
        content:
          "Track symptoms, mood, nutrition and voice check-ins in one private, mobile-first wellness app with AI insights.",
      },
      { property: "og:title", content: "MindTalk AI — your calm AI health companion" },
      {
        property: "og:description",
        content: "Voice logging, mood and symptom tracking, brain games and AI wellness guidance.",
      },
    ],
  }),
  component: Landing,
});

const TEAL = "#2dd4a8";
const INK = "#0d1f1c";
const PANEL = "#14332e";
const PAPER = "#f3f7f5";

const FEATURES = [
  { index: "01", icon: Mic, label: "Voice check-ins", text: "Say how you feel — transcribed and structured." },
  { index: "02", icon: HeartPulse, label: "Body map", text: "Tap a region for metrics and gentle guidance." },
  { index: "03", icon: MessageCircleHeart, label: "AI chat", text: "Wellness conversation, never a diagnosis." },
  { index: "04", icon: Brain, label: "Brain boost", text: "Memory, math and pattern games for focus." },
] as const;

const VITALS = [
  { label: "Heart rate", value: "62 BPM" },
  { label: "Sleep", value: "7H 12M" },
  { label: "Mood", value: "+2 ▲" },
  { label: "Stress", value: "LOW" },
] as const;

function Ecg() {
  return (
    <svg viewBox="0 0 320 80" className="h-20 w-full" role="img" aria-label="Heart rhythm trace">
      <path
        d="M0 44 L60 44 L74 44 L84 14 L96 66 L108 30 L116 44 L160 44 L172 44 L182 20 L194 60 L204 34 L212 44 L320 44"
        fill="none"
        stroke={`${TEAL}33`}
        strokeWidth="2"
        pathLength={1}
      />
      <path
        d="M0 44 L60 44 L74 44 L84 14 L96 66 L108 30 L116 44 L160 44 L172 44 L182 20 L194 60 L204 34 L212 44 L320 44"
        fill="none"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        className="ecg-pulse"
      />
    </svg>
  );
}

function Landing() {
  return (
    <div
      className="px-safe pb-safe flex min-h-screen w-full flex-col overflow-x-hidden"
      style={{ backgroundColor: INK, color: PAPER }}
    >
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-6 md:px-12">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MindTalk AI" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-mono text-sm font-bold tracking-widest" style={{ color: TEAL }}>
            MINDTALK_AI
          </span>
        </div>
        <Link
          to="/auth"
          className="tap flex items-center gap-1 font-mono text-xs uppercase tracking-widest transition-colors"
          style={{ color: `${PAPER}b3` }}
        >
          Sign in <ArrowUpRight className="size-4" />
        </Link>
      </header>

      {/* Main split */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-5 py-12 md:px-12 lg:grid-cols-10 lg:gap-16">
        {/* 60% — narrative + feature index */}
        <div className="lg:col-span-6">
          <div
            className="inline-flex items-center gap-3 rounded-full border px-4 py-1.5"
            style={{ backgroundColor: PANEL, borderColor: `${TEAL}33` }}
          >
            <span className="relative flex size-2">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: TEAL }}
              />
              <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: TEAL }} />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: TEAL }}>
              Privacy-first AI
            </span>
          </div>

          <h1 className="mt-6 font-mono text-5xl font-bold leading-[1.02] tracking-tighter md:text-7xl lg:text-8xl">
            Your body
            <br />
            speaks.
            <br />
            <span style={{ color: TEAL }}>We listen.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: `${PAPER}b3` }}>
            Voice check-ins that track symptoms, mood and nutrition in real time — with a body map,
            an AI wellness coach and brain games, all private to your account.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              to="/auth"
              className="tap flex h-14 items-center justify-center rounded-xl px-8 text-lg font-semibold transition-transform active:scale-95"
              style={{ backgroundColor: TEAL, color: INK }}
            >
              Get started free
            </Link>
            <Link
              to="/auth"
              className="tap flex h-14 items-center justify-center rounded-xl border px-8 text-lg font-semibold transition-colors"
              style={{ borderColor: `${PAPER}33` }}
            >
              I already have an account
            </Link>
          </div>

          {/* Feature index */}
          <div className="mt-12 border-t" style={{ borderColor: `${PAPER}1a` }}>
            {FEATURES.map(({ index, icon: Icon, label, text }) => (
              <div
                key={index}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b py-4"
                style={{ borderColor: `${PAPER}1a` }}
              >
                <span className="font-mono text-xs" style={{ color: TEAL }}>
                  {index}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-bold uppercase tracking-widest">{label}</p>
                  <p className="truncate text-sm" style={{ color: `${PAPER}99` }}>
                    {text}
                  </p>
                </div>
                <Icon className="size-4 shrink-0" style={{ color: `${TEAL}99` }} />
              </div>
            ))}
          </div>
        </div>

        {/* 40% — live vitals panel */}
        <div className="relative overflow-hidden lg:col-span-4 lg:overflow-visible">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-64 rounded-full blur-3xl"
            style={{ backgroundColor: `${TEAL}0d` }}
          />
          <div
            className="relative z-10 rounded-3xl border p-6"
            style={{ backgroundColor: PANEL, borderColor: `${TEAL}26` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: TEAL }}>
                Live check-in
              </span>
              <span className="relative flex size-2">
                <span
                  className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: TEAL }}
                />
                <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: TEAL }} />
              </span>
            </div>

            <div className="mt-6 rounded-2xl p-4" style={{ backgroundColor: INK }}>
              <Ecg />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl" style={{ backgroundColor: `${PAPER}14` }}>
              {VITALS.map(({ label, value }) => (
                <div key={label} className="p-4" style={{ backgroundColor: PANEL }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: `${PAPER}66` }}>
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold" style={{ color: TEAL }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${TEAL}33`, backgroundColor: `${TEAL}0d` }}>
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: TEAL }}>
                AI coach
              </p>
              <p className="mt-1 text-sm" style={{ color: `${PAPER}cc` }}>
                “Your voice sounded lower today — how did you sleep?”
              </p>
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: `${PAPER}4d` }}>
              Private — stored only in your account
            </p>
          </div>
        </div>
      </main>

      {/* Footer band */}
      <footer className="border-t" style={{ borderColor: PANEL }}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-12">
          <p className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-widest" style={{ color: `${PAPER}59` }}>
            Medical disclaimer — MindTalk AI is for informational purposes only and is not a
            substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-widest" style={{ color: `${TEAL}80` }}>
            © 2026 MindTalk AI
          </p>
        </div>
      </footer>
    </div>
  );
}
