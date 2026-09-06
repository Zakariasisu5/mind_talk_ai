import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Loader2, Mic, Search, Square } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeVoiceNote } from "@/lib/ai.functions";
import { useUser } from "@/hooks/useUser";
import { PageHeader, Disclaimer } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { VoiceLogSpeaker } from "@/components/VoiceLogSpeaker";

export const Route = createFileRoute("/_authenticated/voice")({
  head: () => ({
    meta: [
      { title: "Voice health log — MindTalk AI" },
      {
        name: "description",
        content: "Record how you feel and let MindTalk AI transcribe and structure your health check-in.",
      },
      { property: "og:title", content: "Voice health log — MindTalk AI" },
      { property: "og:description", content: "Speak your check-in; we transcribe and summarise it." },
    ],
  }),
  component: VoicePage,
});

function VoicePage() {
  const { user } = useUser();
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeVoiceNote);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [search, setSearch] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logs = useQuery({
    queryKey: ["voice_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const process = useMutation({
    mutationFn: async ({ blob, duration }: { blob: Blob; duration: number }) => {
      const buf = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buf.length; i += 8192) {
        binary += String.fromCharCode(...buf.subarray(i, i + 8192));
      }
      const base64 = btoa(binary);
      const format = blob.type.includes("mp4") ? "m4a" : "webm";
      const result = await analyze({ data: { audioBase64: base64, format } });
      const { error } = await supabase.from("voice_logs").insert({
        user_id: user!.id,
        transcription: result.transcription,
        ai_response: result.aiResponse,
        extracted_data: result.extracted as never,
        duration_seconds: duration,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Voice log saved");
      qc.invalidateQueries({ queryKey: ["voice_logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not process the recording"),
  });

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        if (blob.size > 0) process.mutate({ blob, duration: seconds });
      };
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access is needed to record a voice log.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const filtered = (logs.data ?? []).filter((l) =>
    (l.transcription ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Voice log" subtitle="Say how you feel — we'll do the writing." />

      <div className="space-y-4 px-4 pb-40 lg:pb-6">
        {process.isPending ? (
          <div className="soft-card flex items-center gap-3 p-4 text-sm">
            <Loader2 className="size-4 animate-spin text-primary" />
            Transcribing and analysing your check-in…
          </div>
        ) : null}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your logs"
            className="tap h-12 rounded-2xl pl-9 text-base"
          />
        </div>

        {logs.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        ) : filtered.length ? (
          filtered.map((log) => (
            <article key={log.id} className="soft-card space-y-2 p-4">
              <p className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
                {log.duration_seconds ? ` · ${log.duration_seconds}s` : ""}
              </p>
              <p className="text-sm">{log.transcription}</p>
              {log.ai_response ? (
                <div className="rounded-2xl bg-secondary p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-sm text-secondary-foreground">
                      {log.ai_response}
                    </p>
                    <VoiceLogSpeaker
                      logId={log.id}
                      text={log.ai_response}
                      language="en"
                    />
                  </div>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No voice logs yet. Tap the record button below and describe how you feel.
          </div>
        )}

        <Disclaimer />
      </div>

      {/* Sticky one-thumb record button */}
      <div className="pb-safe px-safe pointer-events-none fixed inset-x-0 bottom-16 z-40 flex justify-center lg:bottom-6">
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={process.isPending}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className={`pointer-events-auto tap mb-3 flex h-16 min-w-16 items-center gap-2 rounded-full px-6 text-base font-semibold text-primary-foreground shadow-lg transition-transform active:scale-95 ${
            recording ? "bg-destructive" : "calm-gradient"
          } disabled:opacity-60`}
        >
          {recording ? <Square className="size-6" /> : <Mic className="size-6" />}
          {recording ? `Stop · ${seconds}s` : "Record"}
        </button>
      </div>
    </div>
  );
}
