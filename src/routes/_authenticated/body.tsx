import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, Brain, Eye, Heart, Loader2, MapPin, Sparkles, Wind, Utensils } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateInsights } from "@/lib/ai.functions";
import { useUser } from "@/hooks/useUser";
import { PageHeader, Disclaimer } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MuteToggle, SpeakButton, VoiceFallbackNotice } from "@/components/SpeechControls";
import { useSpeech } from "@/lib/speech";

export const Route = createFileRoute("/_authenticated/body")({
  head: () => ({
    meta: [
      { title: "Body map — MindTalk AI" },
      {
        name: "description",
        content: "Tap a body region to review your key metrics and get gentle, AI-generated suggestions.",
      },
      { property: "og:title", content: "Body map — MindTalk AI" },
      { property: "og:description", content: "Heart, lungs, stomach, head and eyes at a glance." },
    ],
  }),
  component: BodyPage,
});

type Region = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: Array<{ name: string; unit: string; normal: [number, number]; emergency?: [number, number] }>;
};

const REGIONS: Region[] = [
  {
    key: "heart",
    label: "Heart",
    icon: Heart,
    metrics: [
      { name: "Heart rate", unit: "bpm", normal: [55, 100], emergency: [40, 130] },
      { name: "Blood pressure (systolic)", unit: "mmHg", normal: [95, 130], emergency: [85, 180] },
    ],
  },
  {
    key: "lungs",
    label: "Lungs",
    icon: Wind,
    metrics: [{ name: "Blood oxygen", unit: "%", normal: [95, 100], emergency: [90, 100] }],
  },
  {
    key: "stomach",
    label: "Stomach",
    icon: Utensils,
    metrics: [{ name: "BMI", unit: "", normal: [18.5, 25] }],
  },
  {
    key: "head",
    label: "Head",
    icon: Brain,
    metrics: [{ name: "Sleep", unit: "h", normal: [7, 9], emergency: [4, 14] }],
  },
  {
    key: "eyes",
    label: "Eyes",
    icon: Eye,
    metrics: [{ name: "Screen time", unit: "h", normal: [0, 6] }],
  },
];

function BodyPage() {
  const { user } = useUser();
  const qc = useQueryClient();
  const insights = useServerFn(generateInsights);
  const [active, setActive] = useState(REGIONS[0]!);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [spoken, setSpoken] = useState("");
  const { speak, muted, language } = useSpeech();


  const metrics = useQuery({
    queryKey: ["health_metrics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const latest = (name: string) => (metrics.data ?? []).find((m) => m.metric_name === name);

  const saveMetric = useMutation({
    mutationFn: async ({ name, unit, value }: { name: string; unit: string; value: number }) => {
      const { error } = await supabase
        .from("health_metrics")
        .insert({ user_id: user!.id, metric_name: name, value, unit });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reading saved");
      qc.invalidateQueries({ queryKey: ["health_metrics"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const analyse = useMutation({
    mutationFn: async () => {
      const context = active.metrics
        .map((m) => {
          const v = latest(m.name);
          return `${m.name}: ${v ? `${v.value}${m.unit}` : "not recorded"} (typical ${m.normal[0]}-${m.normal[1]}${m.unit})`;
        })
        .join("\n");
      const { insights: result } = await insights({
        data: { context, focus: `${active.label} health`, language },
      });
      setSuggestions(result.map((r) => `${r.title}: ${r.content}`));
      const audioText = result
        .map((r) => r.spoken?.trim() || `${r.title}. ${r.content}`)
        .join(" ");
      setSpoken(audioText);
      if (audioText && !muted) void speak(audioText, { id: "body-insights" });
      if (result.length && user) {
        await supabase.from("health_insights").insert(
          result.map((r) => ({
            user_id: user.id,
            title: r.title,
            content: r.content,
            category: active.key,
            severity: r.severity ?? "info",
          })),
        );
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate suggestions"),
  });

  const emergencies = REGIONS.flatMap((r) =>
    r.metrics
      .filter((m) => {
        const v = latest(m.name);
        return m.emergency && v && (v.value < m.emergency[0] || v.value > m.emergency[1]);
      })
      .map((m) => `${m.name} is outside the safe range`),
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Body map" subtitle="Tap a region to review it." />

      <div className="space-y-5 px-4 pb-8">
        {emergencies.length ? (
          <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-4">
            <p className="flex items-center gap-2 font-semibold text-destructive">
              <AlertTriangle className="size-5" /> Check on this now
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {emergencies.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <a
              href="https://www.google.com/maps/search/emergency+care+near+me"
              target="_blank"
              rel="noreferrer"
              className="tap mt-3 inline-flex items-center gap-2 rounded-2xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
            >
              <MapPin className="size-4" /> Find care nearby
            </a>
          </div>
        ) : null}

        <div className="grid grid-cols-5 gap-2">
          {REGIONS.map((r) => {
            const Icon = r.icon;
            const on = active.key === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => {
                  setActive(r);
                  setSuggestions([]);
                }}
                className={`tap flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-[11px] font-medium transition-colors ${
                  on ? "calm-gradient text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Icon className="size-5" />
                {r.label}
              </button>
            );
          })}
        </div>

        {metrics.isLoading ? (
          <Skeleton className="h-40 w-full rounded-3xl" />
        ) : (
          <div className="soft-card space-y-4 p-4">
            <p className="text-sm font-semibold">{active.label} metrics</p>
            {active.metrics.map((m) => {
              const current = latest(m.name);
              return (
                <div key={m.name} className="space-y-2">
                  <Label htmlFor={m.name}>
                    {m.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      (typical {m.normal[0]}–{m.normal[1]}
                      {m.unit})
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={m.name}
                      type="number"
                      inputMode="decimal"
                      placeholder={current ? String(current.value) : "—"}
                      value={draft[m.name] ?? ""}
                      onChange={(e) => setDraft({ ...draft, [m.name]: e.target.value })}
                      className="tap h-12 flex-1 rounded-2xl text-base"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="tap h-12 rounded-2xl"
                      onClick={() => {
                        const value = Number(draft[m.name]);
                        if (!draft[m.name] || Number.isNaN(value)) {
                          toast.error("Enter a number first");
                          return;
                        }
                        saveMetric.mutate({ name: m.name, unit: m.unit, value });
                        setDraft({ ...draft, [m.name]: "" });
                      }}
                    >
                      Save
                    </Button>
                  </div>
                  {current ? (
                    <p className="text-xs text-muted-foreground">
                      Latest: {current.value}
                      {m.unit} · {new Date(current.created_at).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              );
            })}

            <Button
              type="button"
              className="tap h-12 w-full rounded-2xl text-base"
              disabled={analyse.isPending}
              onClick={() => analyse.mutate()}
            >
              {analyse.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 size-5" /> Get suggestions
                </>
              )}
            </Button>
          </div>
        )}

        {suggestions.length ? (
          <div className="soft-card space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                Suggestions for your {active.label.toLowerCase()}
              </p>
              <div className="flex items-center gap-1">
                <SpeakButton id="body-insights" text={suggestions.join(" ")} audioText={spoken} />
                <MuteToggle />
              </div>
            </div>
            {suggestions.map((s) => (
              <p key={s} className="text-sm text-muted-foreground">
                {s}
              </p>
            ))}
            <VoiceFallbackNotice />
          </div>
        ) : null}

        <Disclaimer />
      </div>
    </div>
  );
}
