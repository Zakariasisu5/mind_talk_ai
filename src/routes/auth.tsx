import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Disclaimer } from "@/components/AppShell";
import { FaArrowLeft, FaGoogle } from "react-icons/fa";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MindTalk AI" },
      {
        name: "description",
        content:
          "Sign in to MindTalk AI to track symptoms, mood, nutrition and voice health logs in one private space.",
      },
      { property: "og:title", content: "Sign in — MindTalk AI" },
      {
        property: "og:description",
        content: "Your private AI health companion for body and mind.",
      },
    ],
  }),
  component: AuthPage,
});

const BG   = "linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C3FD9 100%)";
const CYAN = "#5EEAD4";
const PANEL = "rgba(255,255,255,0.07)";
const BORDER = "rgba(255,255,255,0.13)";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode]       = useState<"signin" | "signup">("signin");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [busy, setBusy]       = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to MindTalk AI!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/dashboard" });
      else toast.info("Check your inbox to confirm your email, then sign in.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div
      className="px-safe pb-safe flex min-h-screen flex-col items-center justify-center px-5 py-10"
      style={{ background: BG }}
    >
      {/* Back link */}
      <div className="mb-6 w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          <FaArrowLeft size={12} /> Back to home
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 inline-flex">
            <img
              src="/logo.jpeg"
              alt="MindTalk AI"
              className="size-16 rounded-2xl object-cover"
              style={{ boxShadow: `0 0 32px ${CYAN}55` }}
            />
            <span
              className="absolute -bottom-1 -right-1 size-4 rounded-full border-2"
              style={{ background: CYAN, borderColor: "#1E1B4B" }}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">MindTalk AI</h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {mode === "signin"
              ? "Welcome back to your health space."
              : "Create your private health space."}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl p-6"
          style={{ background: PANEL, border: `1px solid ${BORDER}`, backdropFilter: "blur(16px)" }}
        >
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Alex"
                className="indigo-input w-full"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Email</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="indigo-input w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Password</label>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="indigo-input w-full"
            />
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={busy}
            className="tap mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: CYAN, color: "#1E1B4B", boxShadow: `0 0 20px ${CYAN}44` }}
          >
            {busy
              ? <Loader2 className="size-4 animate-spin" />
              : mode === "signin" ? "Sign in" : "Create account"
            }
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span className="h-px flex-1" style={{ background: BORDER }} />
            or
            <span className="h-px flex-1" style={{ background: BORDER }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="tap flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-60"
            style={{ border: `1.5px solid ${BORDER}`, color: "white" }}
          >
            <FaGoogle size={14} />
            Continue with Google
          </button>

          {/* Toggle mode */}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="tap w-full text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {mode === "signin"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Disclaimer className="text-white/30" />
        </div>
      </div>
    </div>
  );
}
