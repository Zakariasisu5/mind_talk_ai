import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Calculator, Grid3x3 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/brain")({
  head: () => ({
    meta: [
      { title: "Brain Boost Buddy — MindTalk AI" },
      {
        name: "description",
        content: "Short memory, math and pattern games to keep your mind sharp, with progress tracking.",
      },
      { property: "og:title", content: "Brain Boost Buddy — MindTalk AI" },
      { property: "og:description", content: "Three quick cognitive games for daily focus." },
    ],
  }),
  component: BrainPage,
});

const STORE_KEY = "mindtalkai.brain.scores";

type Scores = { memory: number; math: number; pattern: number };

function useScores() {
  const [scores, setScores] = useState<Scores>({ memory: 0, math: 0, pattern: 0 });

  useEffect(() => {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        setScores(JSON.parse(raw) as Scores);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const record = (key: keyof Scores, value: number) => {
    setScores((prev) => {
      const next = { ...prev, [key]: Math.max(prev[key], value) };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { scores, record };
}

function BrainPage() {
  const { scores, record } = useScores();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Brain Boost" subtitle="Three minutes of focus training." />
      <div className="space-y-5 px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <Best label="Memory" value={scores.memory} />
          <Best label="Math" value={scores.math} />
          <Best label="Pattern" value={scores.pattern} />
        </div>

        <Tabs defaultValue="memory">
          <TabsList className="grid h-12 w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="memory" className="tap rounded-xl text-sm">
              <Brain className="mr-1 size-4" /> Memory
            </TabsTrigger>
            <TabsTrigger value="math" className="tap rounded-xl text-sm">
              <Calculator className="mr-1 size-4" /> Math
            </TabsTrigger>
            <TabsTrigger value="pattern" className="tap rounded-xl text-sm">
              <Grid3x3 className="mr-1 size-4" /> Pattern
            </TabsTrigger>
          </TabsList>
          <TabsContent value="memory" className="mt-4">
            <MemoryGame onScore={(v) => record("memory", v)} />
          </TabsContent>
          <TabsContent value="math" className="mt-4">
            <MathGame onScore={(v) => record("math", v)} />
          </TabsContent>
          <TabsContent value="pattern" className="mt-4">
            <PatternGame onScore={(v) => record("pattern", v)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Best({ label, value }: { label: string; value: number }) {
  return (
    <div className="soft-card p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

const EMOJIS = ["🌿", "💧", "🍎", "🌙", "☀️", "🫁", "❤️", "🧠"];

function MemoryGame({ onScore }: { onScore: (v: number) => void }) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const reset = () => {
    const deck = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(reset, []);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped as [number, number];
    setMoves((m) => m + 1);
    const t = setTimeout(() => {
      if (cards[a] === cards[b]) setMatched((m) => [...m, a, b]);
      setFlipped([]);
    }, 650);
    return () => clearTimeout(t);
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length && matched.length === cards.length) {
      onScore(Math.max(0, 100 - moves * 3));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched.length, cards.length]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => {
          const open = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (open || flipped.length === 2) return;
                setFlipped((f) => [...f, i]);
              }}
              className={`tap flex aspect-square items-center justify-center rounded-2xl text-2xl transition-colors ${
                open ? "bg-secondary" : "calm-gradient"
              }`}
            >
              {open ? c : ""}
            </button>
          );
        })}
      </div>
      <p className="text-center text-sm text-muted-foreground">Moves: {moves}</p>
      <Button onClick={reset} variant="secondary" className="tap h-12 w-full rounded-2xl">
        New game
      </Button>
    </div>
  );
}

function MathGame({ onScore }: { onScore: (v: number) => void }) {
  const [q, setQ] = useState({ a: 3, b: 4, op: "+" });
  const [answer, setAnswer] = useState("");
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");

  const next = () => {
    const ops = ["+", "-", "×"];
    setQ({
      a: Math.floor(Math.random() * 12) + 2,
      b: Math.floor(Math.random() * 12) + 2,
      op: ops[Math.floor(Math.random() * ops.length)]!,
    });
    setAnswer("");
  };

  const correct = q.op === "+" ? q.a + q.b : q.op === "-" ? q.a - q.b : q.a * q.b;

  return (
    <div className="soft-card space-y-4 p-5 text-center">
      <p className="text-4xl font-semibold">
        {q.a} {q.op} {q.b}
      </p>
      <Input
        type="number"
        inputMode="numeric"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer"
        className="tap h-14 rounded-2xl text-center text-xl"
      />
      <Button
        className="tap h-12 w-full rounded-2xl text-base"
        onClick={() => {
          if (Number(answer) === correct) {
            const s = streak + 1;
            setStreak(s);
            onScore(s);
            setFeedback("Correct!");
          } else {
            setStreak(0);
            setFeedback(`It was ${correct}`);
          }
          next();
        }}
      >
        Check
      </Button>
      <p className="text-sm text-muted-foreground">
        Streak: {streak} {feedback ? `· ${feedback}` : ""}
      </p>
    </div>
  );
}

function PatternGame({ onScore }: { onScore: (v: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  const play = async (seq: number[]) => {
    setShowing(true);
    for (const cell of seq) {
      setActiveCell(cell);
      await new Promise((r) => setTimeout(r, 450));
      setActiveCell(null);
      await new Promise((r) => setTimeout(r, 200));
    }
    setShowing(false);
  };

  const start = () => {
    const seq = [Math.floor(Math.random() * 9)];
    setSequence(seq);
    setInput([]);
    void play(seq);
  };

  const tap = (i: number) => {
    if (showing || !sequence.length) return;
    const next = [...input, i];
    if (sequence[next.length - 1] !== i) {
      setSequence([]);
      setInput([]);
      return;
    }
    if (next.length === sequence.length) {
      onScore(sequence.length);
      const grown = [...sequence, Math.floor(Math.random() * 9)];
      setSequence(grown);
      setInput([]);
      void play(grown);
    } else {
      setInput(next);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className={`tap aspect-square rounded-2xl transition-colors ${
              activeCell === i ? "calm-gradient" : "bg-secondary"
            }`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {sequence.length ? `Level ${sequence.length}` : "Press start and repeat the pattern"}
      </p>
      <Button onClick={start} variant="secondary" className="tap h-12 w-full rounded-2xl">
        {sequence.length ? "Restart" : "Start"}
      </Button>
    </div>
  );
}
