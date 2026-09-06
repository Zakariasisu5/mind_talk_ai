import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  HeartPulse,
  LayoutGrid,
  Mic,
  MessageCircleHeart,
  User,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const TABS: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutGrid },
  { to: "/voice", label: "Voice", icon: Mic },
  { to: "/track", label: "Track", icon: Activity },
  { to: "/chat", label: "Chat", icon: MessageCircleHeart },
  { to: "/profile", label: "Profile", icon: User },
];

const EXTRA: NavItem[] = [
  { to: "/body", label: "Body map", icon: HeartPulse },
  { to: "/brain", label: "Brain boost", icon: Brain },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar — hidden on mobile by design */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar px-4 py-6 lg:block">
        <div className="mb-8 flex items-center gap-2 px-2">
          <img src="/logo.jpeg" alt="MindTalk AI" className="size-9 rounded-xl object-cover" />
          <span className="text-lg font-semibold tracking-tight">MindTalk AI</span>
        </div>
        <nav className="space-y-1">
          {[...TABS, ...EXTRA].map((item) => (
            <SideLink key={item.to} item={item} active={pathname === item.to} />
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <main className="px-safe flex-1 pb-28 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="pb-safe px-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
          <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
            {TABS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <li key={to} className="flex-1">
                  <Link
                    to={to}
                    className={cn(
                      "tap flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full transition-colors",
                        active && "bg-secondary",
                      )}
                    >
                      <Icon className="size-5" />
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

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  const { icon: Icon, label, to } = item;
  return (
    <Link
      to={to}
      className={cn(
        "tap flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

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
    <header className="pt-safe sticky top-0 z-30 -mx-0 mb-4 bg-background/85 backdrop-blur">
      <div className="flex items-end justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("px-1 text-xs leading-relaxed text-muted-foreground", className)}>
      MindTalk AI is a wellness and health tracking application, not a substitute for professional
      medical advice, diagnosis, or treatment.
    </p>
  );
}
