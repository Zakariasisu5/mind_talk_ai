import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type LangCode = "en" | "tw" | "dag" | "ee" | "ga" | "kpo" | "gur" | "ak" | "fat" | "ksm" | "nic" | "dga" | "gon" | "kus";

export const LANGUAGES: Array<{ code: LangCode; label: string; nativeVoice: boolean; region?: string }> = [
  { code: "en", label: "English", nativeVoice: true, region: "Nationwide" },
  
  // Akan Languages
  { code: "tw", label: "Twi (Akan)", nativeVoice: true, region: "Ashanti, Central" },
  { code: "ak", label: "Akuapem Twi", nativeVoice: true, region: "Eastern" },
  { code: "fat", label: "Fante", nativeVoice: true, region: "Central, Western" },
  
  // Northern Languages (Gur/Mole-Dagbani)
  { code: "dag", label: "Dagbani", nativeVoice: true, region: "Northern" },
  { code: "dga", label: "Dagaare", nativeVoice: true, region: "Upper West" },
  { code: "gur", label: "Gurene", nativeVoice: true, region: "Upper East" },
  { code: "kus", label: "Kusaal", nativeVoice: true, region: "Upper East" },
  { code: "ksm", label: "Kasem", nativeVoice: false, region: "Upper East" },
  
  // Other Major Languages
  { code: "ee", label: "Ewe", nativeVoice: true, region: "Volta, Oti" },
  { code: "ga", label: "Ga", nativeVoice: true, region: "Greater Accra" },
  { code: "gon", label: "Gonja", nativeVoice: true, region: "Savannah" },
  
  // Smaller Languages
  { code: "kpo", label: "Ikposo", nativeVoice: false, region: "Oti" },
  { code: "nic", label: "Nzema", nativeVoice: false, region: "Western" },
];

export function languageLabel(code: LangCode) {
  return LANGUAGES.find((l) => l.code === code)?.label ?? "English";
}

export function hasNativeVoice(code: LangCode) {
  return LANGUAGES.find((l) => l.code === code)?.nativeVoice ?? false;
}

const MUTE_KEY = "mindtalkai.speech.muted";
const LANG_KEY = "mindtalkai.speech.language";

type SpeakOptions = { id?: string; audioText?: string };

type SpeechValue = {
  muted: boolean;
  setMuted: (v: boolean) => void;
  toggleMuted: () => void;
  language: LangCode;
  setLanguage: (l: LangCode) => void;
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  stop: () => void;
  speakingId: string | null;
  isSpeaking: boolean;
};

const SpeechContext = createContext<SpeechValue | null>(null);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const [language, setLanguageState] = useState<LangCode>("en");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      setMutedState(localStorage.getItem(MUTE_KEY) === "1");
      const stored = localStorage.getItem(LANG_KEY) as LangCode | null;
      if (stored && LANGUAGES.some((l) => l.code === stored)) setLanguageState(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    for (const s of sourcesRef.current) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    sourcesRef.current = [];
    // Stop browser speech synthesis if it's running
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  const setMuted = useCallback(
    (v: boolean) => {
      setMutedState(v);
      try {
        localStorage.setItem(MUTE_KEY, v ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (v) stop();
    },
    [stop],
  );

  const setLanguage = useCallback((l: LangCode) => {
    setLanguageState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const speak = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      const spoken = (options.audioText ?? text).trim();
      if (!spoken || typeof window === "undefined") return;
      stop();

      const id = options.id ?? "speech";
      setSpeakingId(id);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let ctx = ctxRef.current;
        if (!ctx || ctx.state === "closed") {
          ctx = new AudioContext({ sampleRate: 24000 });
          ctxRef.current = ctx;
        }
        if (ctx.state === "suspended") await ctx.resume().catch(() => {});

        let playhead = 0;
        let pending = new Uint8Array(0);

        const playChunk = (incoming: Uint8Array) => {
          const audio = ctxRef.current;
          if (!audio) return;
          const bytes = new Uint8Array(pending.length + incoming.length);
          bytes.set(pending);
          bytes.set(incoming, pending.length);
          const usable = bytes.length - (bytes.length % 2);
          pending = bytes.slice(usable);
          if (usable === 0) return;
          const samples = new Int16Array(bytes.buffer, 0, usable / 2);
          const floats = Float32Array.from(samples, (s) => s / 32768);
          const buffer = audio.createBuffer(1, floats.length, 24000);
          buffer.copyToChannel(floats, 0);
          const source = audio.createBufferSource();
          source.buffer = buffer;
          source.connect(audio.destination);
          if (playhead === 0) playhead = audio.currentTime + 0.05;
          else playhead = Math.max(playhead, audio.currentTime);
          source.start(playhead);
          playhead += buffer.duration;
          sourcesRef.current.push(source);
        };

        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: spoken }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Voice output failed (${res.status})`);

        // Check if response is JSON (browser TTS fallback) or SSE stream
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          // Use browser's built-in speech synthesis
          const data = await res.json();
          if (data.useBrowserTTS && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(data.text || spoken);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = "en-US";
            
            utterance.onend = () => {
              setSpeakingId((cur) => (cur === id ? null : cur));
            };
            
            utterance.onerror = () => {
              setSpeakingId((cur) => (cur === id ? null : cur));
            };
            
            window.speechSynthesis.speak(utterance);
            return;
          }
          throw new Error("Browser TTS not supported");
        }

        if (!res.body) throw new Error("No response body");
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              let event: { type?: string; audio?: string };
              try {
                event = JSON.parse(payload);
              } catch {
                continue;
              }
              if (event.type !== "speech.audio.delta" || !event.audio) continue;
              const binary = atob(event.audio);
              const chunk = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) chunk[i] = binary.charCodeAt(i);
              playChunk(chunk);
            }
          }
        }

        const tail = playhead - (ctxRef.current?.currentTime ?? 0);
        window.setTimeout(
          () => setSpeakingId((cur) => (cur === id ? null : cur)),
          Math.max(0, tail * 1000),
        );
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("TTS error", err);
        }
        setSpeakingId((cur) => (cur === id ? null : cur));
      }
    },
    [stop],
  );

  const value = useMemo<SpeechValue>(
    () => ({
      muted,
      setMuted,
      toggleMuted: () => setMuted(!muted),
      language,
      setLanguage,
      speak,
      stop,
      speakingId,
      isSpeaking: speakingId !== null,
    }),
    [muted, setMuted, language, setLanguage, speak, stop, speakingId],
  );

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSpeech() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error("useSpeech must be used inside SpeechProvider");
  return ctx;
}
