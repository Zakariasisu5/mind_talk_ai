import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useUser } from "@/hooks/useUser";
import { PageHeader, Disclaimer } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/track")({
  head: () => ({
    meta: [
      { title: "Track symptoms, mood & meals — MindTalk AI" },
      {
        name: "description",
        content: "Log symptoms, mood, energy and meals in seconds and watch your patterns over time.",
      },
      { property: "og:title", content: "Track symptoms, mood & meals — MindTalk AI" },
      { property: "og:description", content: "Fast daily logging for body and mind." },
    ],
  }),
  component: TrackPage,
});

const BODY_AREAS = ["Head", "Chest", "Stomach", "Back", "Limbs", "Whole body"];
const MOODS = ["Great", "Good", "Okay", "Low", "Anxious", "Stressed"];
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

function TrackPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Track" subtitle="A few taps keeps your patterns visible." />
      <div className="px-4">
        <Tabs defaultValue="symptoms">
          <TabsList className="grid h-12 w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="symptoms" className="tap rounded-xl text-sm">
              Symptoms
            </TabsTrigger>
            <TabsTrigger value="mood" className="tap rounded-xl text-sm">
              Mood
            </TabsTrigger>
            <TabsTrigger value="food" className="tap rounded-xl text-sm">
              Meals
            </TabsTrigger>
          </TabsList>
          <TabsContent value="symptoms" className="mt-4">
            <SymptomTab />
          </TabsContent>
          <TabsContent value="mood" className="mt-4">
            <MoodTab />
          </TabsContent>
          <TabsContent value="food" className="mt-4">
            <NutritionTab />
          </TabsContent>
        </Tabs>
        <Disclaimer className="my-6" />
      </div>
    </div>
  );
}

function useList<T>(table: "symptoms" | "mood_entries" | "nutrition_entries", userId?: string) {
  return useQuery({
    queryKey: [table, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}

function SymptomTab() {
  const { user } = useUser();
  const qc = useQueryClient();
  const list = useList<Tables<"symptoms">>("symptoms", user?.id);
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState(5);
  const [area, setArea] = useState(BODY_AREAS[0]!);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Give the symptom a name");
      const { error } = await supabase.from("symptoms").insert({
        user_id: user!.id,
        name: name.trim(),
        severity,
        body_area: area ?? null,
        duration: duration || null,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Symptom logged");
      setName("");
      setNotes("");
      setDuration("");
      setSeverity(5);
      qc.invalidateQueries({ queryKey: ["symptoms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const counts = new Map<string, number>();
  (list.data ?? []).forEach((s) => counts.set(s.name, (counts.get(s.name) ?? 0) + 1));
  const recurring = [...counts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <form
        className="soft-card space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="symptom">Symptom</Label>
          <Input
            id="symptom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Headache"
            className="tap h-12 rounded-2xl text-base"
          />
        </div>
        <div className="space-y-2">
          <Label>Severity: {severity}/10</Label>
          <Slider
            value={[severity]}
            onValueChange={(v) => setSeverity(v[0]!)}
            min={1}
            max={10}
            step={1}
            className="py-3"
          />
        </div>
        <div className="space-y-2">
          <Label>Body area</Label>
          <ChipGroup options={BODY_AREAS} value={area} onChange={setArea} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">How long?</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="2 hours"
            className="tap h-12 rounded-2xl text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-notes">Notes</Label>
          <Textarea
            id="s-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 rounded-2xl text-base"
          />
        </div>
        <SaveButton pending={save.isPending} label="Log symptom" />
      </form>

      {recurring.length ? (
        <div className="soft-card p-4">
          <p className="text-sm font-semibold">Recurring for you</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recurring.map(([n, c]) => (
              <span key={n} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                {n} · {c}×
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <History
        loading={list.isLoading}
        empty="No symptoms logged yet."
        items={(list.data ?? []).map((s) => ({
          id: s.id,
          title: `${s.name} · ${s.severity}/10`,
          meta: `${s.body_area ?? "unspecified"} · ${new Date(s.created_at).toLocaleString()}`,
          body: s.notes ?? undefined,
        }))}
      />
    </div>
  );
}

function MoodTab() {
  const { user } = useUser();
  const qc = useQueryClient();
  const list = useList<Tables<"mood_entries">>("mood_entries", user?.id);
  const [mood, setMood] = useState(MOODS[0]!);
  const [score, setScore] = useState(7);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(4);
  const [anxiety, setAnxiety] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("mood_entries").insert({
        user_id: user!.id,
        mood,
        mood_score: score,
        energy_level: energy,
        stress_level: stress,
        anxiety_level: anxiety,
        sleep_quality: sleep,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Check-in saved");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["mood_entries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const chart = [...(list.data ?? [])]
    .slice(0, 14)
    .reverse()
    .map((m) => ({
      day: new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: m.mood_score,
      energy: m.energy_level ?? 0,
    }));

  return (
    <div className="space-y-5">
      <form
        className="soft-card space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label>How do you feel?</Label>
          <ChipGroup options={MOODS} value={mood} onChange={setMood} />
        </div>
        <SliderRow label="Mood" value={score} onChange={setScore} />
        <SliderRow label="Energy" value={energy} onChange={setEnergy} />
        <SliderRow label="Stress" value={stress} onChange={setStress} />
        <SliderRow label="Anxiety" value={anxiety} onChange={setAnxiety} />
        <SliderRow label="Sleep quality" value={sleep} onChange={setSleep} />
        <div className="space-y-2">
          <Label htmlFor="m-notes">Anything on your mind?</Label>
          <Textarea
            id="m-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 rounded-2xl text-base"
          />
        </div>
        <SaveButton pending={save.isPending} label="Save check-in" />
      </form>

      {chart.length > 1 ? (
        <div className="soft-card p-4">
          <p className="mb-3 text-sm font-semibold">Mood & energy trend</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip />
                <Line type="monotone" dataKey="mood" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="energy" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      <History
        loading={list.isLoading}
        empty="No mood check-ins yet."
        items={(list.data ?? []).map((m) => ({
          id: m.id,
          title: `${m.mood} · ${m.mood_score}/10`,
          meta: new Date(m.created_at).toLocaleString(),
          body: m.notes ?? undefined,
        }))}
      />
    </div>
  );
}

function NutritionTab() {
  const { user } = useUser();
  const qc = useQueryClient();
  const list = useList<Tables<"nutrition_entries">>("nutrition_entries", user?.id);
  const [meal, setMeal] = useState(MEALS[0]!);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!food.trim()) throw new Error("Add what you ate");
      const { error } = await supabase.from("nutrition_entries").insert({
        user_id: user!.id,
        meal_type: meal,
        food_items: food.trim(),
        calories: calories ? Number(calories) : null,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Meal logged");
      setFood("");
      setCalories("");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["nutrition_entries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const today = new Date().toDateString();
  const todays = (list.data ?? []).filter((n) => new Date(n.created_at).toDateString() === today);
  const total = todays.reduce((s, n) => s + (n.calories ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="soft-card p-4">
        <p className="text-sm text-muted-foreground">Today</p>
        <p className="text-3xl font-semibold">{total} kcal</p>
        <p className="text-xs text-muted-foreground">{todays.length} meals logged</p>
      </div>

      <form
        className="soft-card space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label>Meal</Label>
          <ChipGroup options={MEALS} value={meal} onChange={setMeal} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="food">What did you eat?</Label>
          <Textarea
            id="food"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="Oats, banana, coffee"
            className="min-h-24 rounded-2xl text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cal">Calories (optional)</Label>
          <Input
            id="cal"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="tap h-12 rounded-2xl text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="n-notes">Notes</Label>
          <Input
            id="n-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="tap h-12 rounded-2xl text-base"
          />
        </div>
        <SaveButton pending={save.isPending} label="Log meal" />
      </form>

      <History
        loading={list.isLoading}
        empty="No meals logged yet."
        items={(list.data ?? []).map((n) => ({
          id: n.id,
          title: `${n.meal_type}${n.calories ? ` · ${n.calories} kcal` : ""}`,
          meta: new Date(n.created_at).toLocaleString(),
          body: n.food_items,
        }))}
      />
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`tap rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
            value === o
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}: {value}/10
      </Label>
      <Slider value={[value]} onValueChange={(v) => onChange(v[0]!)} min={1} max={10} step={1} className="py-3" />
    </div>
  );
}

function SaveButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button type="submit" disabled={pending} className="tap h-12 w-full rounded-2xl text-base">
      {pending ? <Loader2 className="size-5 animate-spin" /> : label}
    </Button>
  );
}

function History({
  loading,
  items,
  empty,
}: {
  loading: boolean;
  items: Array<{ id: string; title: string; meta: string; body?: string | undefined }>;
  empty: string;
}) {
  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-20 w-full rounded-3xl" />
      </div>
    );
  if (!items.length)
    return (
      <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="soft-card p-4">
          <p className="font-medium">{i.title}</p>
          <p className="text-xs text-muted-foreground">{i.meta}</p>
          {i.body ? <p className="mt-2 text-sm text-muted-foreground">{i.body}</p> : null}
        </div>
      ))}
    </div>
  );
}
