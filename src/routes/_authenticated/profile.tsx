import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileUp, Loader2, LogOut, Moon, Phone, Plus, Sun, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile & emergency contacts — MindTalk AI" },
      {
        name: "description",
        content: "Manage your profile, emergency contacts and upload medical reports for AI insights.",
      },
      { property: "og:title", content: "Profile — MindTalk AI" },
      { property: "og:description", content: "Your account, contacts and medical report uploads." },
    ],
  }),
  component: ProfilePage,
});

const PUBLIC_NUMBERS = [
  { label: "Emergency (US/Canada)", number: "911" },
  { label: "Emergency (EU)", number: "112" },
  { label: "Emergency (UK)", number: "999" },
  { label: "Suicide & Crisis Lifeline (US)", number: "988" },
];

function ProfilePage() {
  const { user } = useUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const insights = useServerFn(generateInsights);
  const [dark, setDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });
  const [reportInsights, setReportInsights] = useState<string[]>([]);
  const [reportSpoken, setReportSpoken] = useState("");
  const { speak, muted, language } = useSpeech();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const contacts = useQuery({
    queryKey: ["emergency_contacts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addContact = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.phone.trim()) throw new Error("Name and phone are required");
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: user!.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        relationship: form.relationship.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ name: "", phone: "", relationship: "" });
      toast.success("Contact added");
      qc.invalidateQueries({ queryKey: ["emergency_contacts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add contact"),
  });

  const removeContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency_contacts"] }),
  });

  const uploadReport = useMutation({
    mutationFn: async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please choose a .csv file");
      const text = await file.text();
      const rows = text
        .split(/\r?\n/)
        .map((r) => r.split(",").map((c) => c.trim().replace(/^"|"$/g, "")))
        .filter((r) => r.some((c) => c.length));
      if (rows.length < 2) throw new Error("This file has no data rows");

      const header = rows[0]!.map((h) => h.toLowerCase());
      const idx = {
        section: header.findIndex((h) => h.includes("section")),
        metric: header.findIndex((h) => h.includes("metric") || h.includes("test") || h.includes("name")),
        value: header.findIndex((h) => h.includes("value") || h.includes("result")),
        unit: header.findIndex((h) => h.includes("unit")),
      };
      if (idx.metric < 0 || idx.value < 0) {
        throw new Error("CSV needs at least 'metric' and 'value' columns");
      }

      const parsed = rows.slice(1).map((r) => ({
        section: idx.section >= 0 ? (r[idx.section] ?? "") : "",
        metric: r[idx.metric] ?? "",
        value: Number(r[idx.value]),
        unit: idx.unit >= 0 ? (r[idx.unit] ?? "") : "",
      }));
      const valid = parsed.filter((p) => p.metric && !Number.isNaN(p.value));
      if (!valid.length) throw new Error("No numeric metric values found");

      const { error } = await supabase.from("health_metrics").insert(
        valid.map((v) => ({
          user_id: user!.id,
          metric_name: v.metric,
          value: v.value,
          unit: v.unit || null,
          source: "medical_report",
        })),
      );
      if (error) throw error;

      const context = valid.map((v) => `${v.section} ${v.metric}: ${v.value}${v.unit}`).join("\n");
      const { insights: result } = await insights({
        data: { context, focus: "medical report review", language },
      });
      setReportInsights(result.map((r) => `${r.title}: ${r.content}`));
      const audioText = result.map((r) => r.spoken?.trim() || `${r.title}. ${r.content}`).join(" ");
      setReportSpoken(audioText);
      if (audioText && !muted) void speak(audioText, { id: "report-insights" });
      if (result.length) {
        await supabase.from("health_insights").insert(
          result.map((r) => ({
            user_id: user!.id,
            title: r.title,
            content: r.content,
            category: "report",
            severity: r.severity ?? "info",
          })),
        );
      }
      return valid.length;
    },
    onSuccess: (count) => {
      toast.success(`Imported ${count} metrics`);
      qc.invalidateQueries({ queryKey: ["health_metrics"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not read that file"),
  });

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("mindtalkai.theme", next ? "dark" : "light");
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Profile" subtitle={user?.email ?? ""} />

      <div className="space-y-5 px-4 pb-8">
        <section className="soft-card space-y-3 p-4">
          <p className="text-sm font-semibold">Account</p>
          {profile.isLoading ? (
            <Skeleton className="h-10 w-full rounded-2xl" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile.data?.display_name || "No name set"} · {user?.email}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="tap h-12 flex-1 rounded-2xl" onClick={toggleTheme}>
              {dark ? <Sun className="mr-2 size-5" /> : <Moon className="mr-2 size-5" />}
              {dark ? "Light mode" : "Dark mode"}
            </Button>
            <Button
              variant="outline"
              className="tap h-12 flex-1 rounded-2xl"
              onClick={async () => {
                await supabase.auth.signOut();
                qc.clear();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="mr-2 size-5" /> Sign out
            </Button>
          </div>
        </section>

        <section className="soft-card space-y-3 p-4">
          <p className="text-sm font-semibold">Medical report (CSV)</p>
          <p className="text-xs text-muted-foreground">
            Columns: section, metric, value, unit. We store the metrics and generate general insights.
          </p>
          <Label
            htmlFor="report"
            className="tap flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-medium"
          >
            {uploadReport.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <FileUp className="size-5" /> Choose CSV file
              </>
            )}
          </Label>
          <input
            id="report"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadReport.mutate(file);
              e.target.value = "";
            }}
          />
          {reportInsights.length ? (
            <div className="flex items-center justify-end gap-1">
              <SpeakButton
                id="report-insights"
                text={reportInsights.join(" ")}
                audioText={reportSpoken}
              />
              <MuteToggle />
            </div>
          ) : null}
          {reportInsights.map((i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {i}
            </p>
          ))}
          {reportInsights.length ? <VoiceFallbackNotice /> : null}
        </section>

        <section className="soft-card space-y-3 p-4">
          <p className="text-sm font-semibold">Emergency contacts</p>
          {contacts.isLoading ? (
            <Skeleton className="h-16 w-full rounded-2xl" />
          ) : (
            (contacts.data ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.phone}
                    {c.relationship ? ` · ${c.relationship}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`} className="tap grid size-11 place-items-center rounded-full">
                    <Phone className="size-5 text-primary" />
                  </a>
                  <button
                    type="button"
                    aria-label={`Remove ${c.name}`}
                    onClick={() => removeContact.mutate(c.id)}
                    className="tap grid size-11 place-items-center rounded-full"
                  >
                    <Trash2 className="size-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="space-y-2">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="tap h-12 rounded-2xl text-base"
            />
            <Input
              placeholder="Phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="tap h-12 rounded-2xl text-base"
            />
            <Input
              placeholder="Relationship (optional)"
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              className="tap h-12 rounded-2xl text-base"
            />
            <Button
              className="tap h-12 w-full rounded-2xl text-base"
              disabled={addContact.isPending}
              onClick={() => addContact.mutate()}
            >
              <Plus className="mr-2 size-5" /> Add contact
            </Button>
          </div>
        </section>

        <section className="soft-card space-y-2 p-4">
          <p className="text-sm font-semibold">Public emergency numbers</p>
          {PUBLIC_NUMBERS.map((n) => (
            <a
              key={n.number}
              href={`tel:${n.number}`}
              className="tap flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm"
            >
              <span>{n.label}</span>
              <span className="font-semibold text-primary">{n.number}</span>
            </a>
          ))}
        </section>

        <Disclaimer />
      </div>
    </div>
  );
}
