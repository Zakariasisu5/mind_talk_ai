import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { askHealthCoach } from "@/lib/ai.functions";
import { useUser } from "@/hooks/useUser";
import { PageHeader } from "@/components/AppShell";
import { LanguagePicker, MuteToggle, SpeakButton, VoiceFallbackNotice } from "@/components/SpeechControls";
import { useSpeech } from "@/lib/speech";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "AI wellness chat — MindTalk AI" },
      {
        name: "description",
        content: "Ask general wellness questions and get warm, practical guidance — never a diagnosis.",
      },
      { property: "og:title", content: "AI wellness chat — MindTalk AI" },
      { property: "og:description", content: "A calm companion for everyday wellbeing questions." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { user } = useUser();
  const qc = useQueryClient();
  const ask = useServerFn(askHealthCoach);
  const { speak, stop, muted, language } = useSpeech();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useQuery({
    queryKey: ["chat_messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      const history = (messages.data ?? []).slice(-10).map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));
      await supabase.from("chat_messages").insert({ user_id: user!.id, role: "user", content: text });
      await qc.invalidateQueries({ queryKey: ["chat_messages"] });
      const { reply, audioText } = await ask({ data: { message: text, history, language } });
      const { data: inserted } = await supabase
        .from("chat_messages")
        .insert({ user_id: user!.id, role: "assistant", content: reply })
        .select("id")
        .maybeSingle();
      return { reply, audioText, id: inserted?.id ?? "latest" };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["chat_messages"] });
      if (!muted && result) {
        void speak(result.reply, { id: result.id, audioText: result.audioText });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "The assistant is unavailable"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || send.isPending) return;
    stop();
    setInput("");
    send.mutate(text);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <PageHeader
        title="Wellness chat"
        subtitle="Replies are read aloud automatically."
        action={
          <div className="flex items-center gap-2">
            <LanguagePicker />
            <MuteToggle />
          </div>
        }
      />

      <div className="flex-1 space-y-3 px-4 pb-44 lg:pb-28">
        <p className="rounded-2xl bg-secondary px-4 py-3 text-xs leading-relaxed text-secondary-foreground">
          MindTalk AI is a wellness and health tracking application, not a substitute for professional
          medical advice, diagnosis, or treatment. In an emergency, contact local emergency services.
        </p>

        <VoiceFallbackNotice />

        {muted ? (
          <p className="px-1 text-xs text-muted-foreground">
            Voice replies are muted. Tap the speaker icon to hear answers spoken aloud.
          </p>
        ) : null}

        {messages.isLoading ? (
          <>
            <Skeleton className="h-16 w-3/4 rounded-3xl" />
            <Skeleton className="ml-auto h-16 w-2/3 rounded-3xl" />
          </>
        ) : null}

        {(messages.data ?? []).map((m) => (
          <div
            key={m.id}
            className={`flex max-w-[92%] items-start gap-1 ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
          >
            <div
              className={`whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "soft-card"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" ? <SpeakButton id={m.id} text={m.content} /> : null}
          </div>
        ))}

        {send.isPending ? (
          <div className="soft-card mr-auto flex max-w-[85%] items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </div>
        ) : null}

        {!messages.isLoading && !(messages.data ?? []).length ? (
          <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Ask about sleep, stress, hydration, movement or nutrition habits.
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={submit}
        className="pb-safe px-safe fixed inset-x-0 bottom-16 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:bottom-0"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I sleep better?"
            rows={1}
            className="tap max-h-32 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={send.isPending}
            className="calm-gradient tap flex size-12 items-center justify-center rounded-2xl text-primary-foreground disabled:opacity-60"
          >
            <Send className="size-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
