import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Apple,
  Brain,
  HeartPulse,
  Mic,
  Smile,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { PageHeader, Disclaimer } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { MuteToggle, SpeakButton } from "@/components/SpeechControls";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your health dashboard — MindTalk AI" },
      {
        name: "description",
        content: "A quick glance at your recent voice logs, symptoms, mood entries and AI insights.",
      },
      { property: "og:title", content: "Your health dashboard — MindTalk AI" },
      { property: "og:description", content: "Voice logs, symptoms, mood and AI insights in one place." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [voice, symptoms, mood, nutrition, insights] = await Promise.all([
        supabase.from("voice_logs").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("symptoms").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("mood_entries").select("*").order("created_at", { ascending: false }).limit(7),
        supabase.from("nutrition_entries").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("health_insights").select("*").order("created_at", { ascending: false }).limit(3),
      ]);
      return {
        voice: voice.data ?? [],
        symptoms: symptoms.data ?? [],
        mood: mood.data ?? [],
        nutrition: nutrition.data ?? [],
        insights: insights.data ?? [],
      };
    },
  });

  const today = new Date().toDateString();
  const caloriesToday = (data?.nutrition ?? [])
    .filter((n) => new Date(n.created_at).toDateString() === today)
    .reduce((sum, n) => sum + (n.calories ?? 0), 0);
  const latestMood = data?.mood?.[0];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title={`${greeting()}${user?.user_metadata?.["display_name"] ? `, ${user.user_metadata["display_name"]}` : ""}`}
        subtitle="Here's how you're doing today."
      />

      <div className="space-y-5 px-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Mood"
            value={latestMood ? `${latestMood.mood_score}/10` : "—"}
            hint={latestMood?.mood ?? "Not logged yet"}
            icon={Smile}
          />
          <StatCard
            label="Calories today"
            value={caloriesToday ? String(caloriesToday) : "—"}
            hint="from logged meals"
            icon={Apple}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/voice" label="Voice log" icon={Mic} />
          <QuickAction to="/track" label="Log entry" icon={Activity} />
          <QuickAction to="/body" label="Body map" icon={HeartPulse} />
          <QuickAction to="/brain" label="Brain boost" icon={Brain} />
        </div>

        <Section title="AI insights" icon={Sparkles}>
          {isLoading ? (
            <SkeletonList />
          ) : data?.insights.length ? (
            <>
              <div className="flex justify-end">
                <MuteToggle />
              </div>
              {data.insights.map((i) => (
                <div key={i.id} className="soft-card flex items-start gap-2 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{i.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{i.content}</p>
                  </div>
                  <SpeakButton id={`insight-${i.id}`} text={`${i.title}. ${i.content}`} />
                </div>
              ))}
            </>
          ) : (
            <Empty text="Log a voice note or open the body map to generate your first insights." />
          )}
        </Section>

        <Section title="Recent voice logs" icon={Mic}>
          {isLoading ? (
            <SkeletonList />
          ) : data?.voice.length ? (
            data.voice.map((v) => (
              <div key={v.id} className="soft-card space-y-2 p-4">
                <p className="line-clamp-3 text-sm">{v.transcription || "No transcript"}</p>
                {v.ai_response && (
                  <div className="flex items-start justify-between gap-3 rounded-2xl bg-secondary/50 p-3">
                    <p className="flex-1 text-sm text-secondary-foreground line-clamp-2">
                      {v.ai_response}
                    </p>
                    <SpeakButton
                      id={`voice-${v.id}`}
                      text={v.ai_response}
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(v.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <Empty text="No voice logs yet — tap Voice to record how you feel." />
          )}
        </Section>

        <Section title="Recent symptoms" icon={Activity}>
          {isLoading ? (
            <SkeletonList />
          ) : data?.symptoms.length ? (
            data.symptoms.map((s) => (
              <div key={s.id} className="soft-card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.body_area ?? "unspecified"} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {s.severity}/10
                </span>
              </div>
            ))
          ) : (
            <Empty text="Nothing logged. That's good news." />
          )}
        </Section>

        <Disclaimer className="pb-4" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="soft-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function QuickAction({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="tap soft-card flex items-center gap-3 p-4 text-sm font-medium active:scale-[0.98] transition-transform"
    >
      <span className="calm-gradient flex size-9 items-center justify-center rounded-2xl">
        <Icon className="size-5 text-primary-foreground" />
      </span>
      {label}
    </Link>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-3xl" />
      <Skeleton className="h-20 w-full rounded-3xl" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
