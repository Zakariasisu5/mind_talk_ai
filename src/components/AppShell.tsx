import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { MdDashboard, MdMic, MdChat, MdPerson } from "react-icons/md";
import { FaHeartbeat, FaBrain } from "react-icons/fa";
import { GiBodyBalance } from "react-icons/gi";
import { IoStatsChart } from "react-icons/io5";

/* ── Palette (matches landing) ─────────────────────────────────── */
const SIDEBAR_BG    = "linear-gradient(180deg, #1E1B4B 0%, #2D2A6E 100%)";
const ACTIVE_BG     = "rgba(94,234,212,0.12)";
const ACTIVE_BORDER = "rgba(94,234,212,0.35)";
const CYAN          = "#5EEAD4";
const WHITE_DIM     = "rgba(255,255,255,0.55)";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
};

const TABS: NavItem[] = [
  { to: "/dashboard", label: "Home",    icon: MdDashboard,  color: "#818cf8" },
  { to: "/voice",     label: "Voice",   icon: MdMic,        color: "#f472b6" },
  { to: "/track",     label: "Track",   icon: IoStatsChart, color: "#fb923c" },
  { to: "/chat",      label: "Chat",    icon: MdChat,       color: CYAN      },
  { to: "/profile",   label: "Profile", icon: MdPerson,     color: "#60a5fa" },
];

const EXTRA: NavItem[] = [
  { to: "/body",  label: "Body map",    icon: GiBodyBalance, color: "#f87171" },
  { to: "/brain", label: "Brain boost", icon: FaBrain,       color: "#a78bfa" },
];

/* ── Shell ─────────────────────────────────────────────────────── */
export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background lg:flex">

      {/* Desktop sidebar */}
      <aside
        className="hidden w-64 shrink-0 lg:flex lg:flex-col"
        style={{ background: SIDEBAR_BG, borderRight: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <img
            src="/logo.jpeg"
            alt="MindTalk AI"
            className="size-9 rounded-xl object-cover"
            style={{ boxShadow: `0 0 12px ${CYAN}55` }}
          />
          <span className="text-base font-bold tracking-tight text-white">MindTalk AI</span>
        </div>

        {/* Label */}
        <p className="mb-2 px-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: WHITE_DIM }}>
          Navigation
        </p>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 px-3">
          {[...TABS, ...EXTRA].map((item) => (
            <SideLink key={item.to} item={item} active={pathname === item.to} />
          ))}
        </nav>

        {/* Bottom disclaimer */}
        <p className="px-5 pb-6 pt-4 text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
          MindTalk AI is not a substitute for professional medical advice.
        </p>
      </aside>

      {/* Main content */}
      <div className="app-content-bg flex min-h-screen flex-1 flex-col">
        <main className="px-safe flex-1 pb-28 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="pb-safe px-safe fixed inset-x-0 bottom-0 z-40 lg:hidden"
          style={{
            background: "rgba(30,27,75,0.96)",
            borderTop: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(20px)",
          }}
        >
          <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
            {TABS.map(({ to, label, icon: Icon, color }) => {
              const active = pathname === to;
              return (
                <li key={to} className="flex-1">
                  <Link
                    to={to}
                    className="tap flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-all"
                    style={{ color: active ? color : WHITE_DIM }}
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-2xl transition-all"
                      style={
                        active
                          ? { background: ACTIVE_BG, border: `1px solid ${ACTIVE_BORDER}` }
                          : undefined
                      }
                    >
                      <Icon size={19} style={{ color: active ? color : undefined }} />
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

/* ── Sidebar link ──────────────────────────────────────────────── */
function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  const { icon: Icon, label, to, color } = item;
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all"
      style={
        active
          ? { background: ACTIVE_BG, border: `1px solid ${ACTIVE_BORDER}`, color }
          : { color: WHITE_DIM, border: "1px solid transparent" }
      }
    >
      {/* Icon pill */}
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-xl transition-all"
        style={active ? { background: `${color}22` } : undefined}
      >
        <Icon size={17} style={{ color: active ? color : undefined }} />
      </span>
      {label}

      {/* Active indicator dot */}
      {active && (
        <span
          className="ml-auto size-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
      )}
    </Link>
  );
}

/* ── PageHeader ────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header
      className="app-page-header pt-safe sticky top-0 z-30 mb-4 backdrop-blur"
      style={{ background: "rgba(248,247,255,0.9)", borderBottom: "1px solid rgba(76,63,217,0.10)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "#1E1B4B" }}>{title}</h1>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <img
            src="/logo.jpeg"
            alt="MindTalk AI"
            className="size-8 rounded-xl object-cover lg:hidden"
            style={{ boxShadow: "0 0 8px rgba(94,234,212,0.4)" }}
          />
        </div>
      </div>
    </header>
  );
}

/* ── Disclaimer ────────────────────────────────────────────────── */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("px-1 text-xs leading-relaxed text-muted-foreground", className)}>
      MindTalk AI is a wellness and health tracking application, not a substitute for professional
      medical advice, diagnosis, or treatment.
    </p>
  );
}
