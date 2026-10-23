"use client";

import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui";
import { BANDS, GATE_MODE, QUESTIONS, type GateMode } from "@/lib/content";
import {
  answersSchema,
  assessmentSchema,
  leadSchema,
  type Answers,
  type Assessment,
  type Lead,
} from "@/lib/schemas";
import { MAX_POINTS, SCORED_QUESTIONS, score } from "@/lib/scoring";

import { LeadForm } from "./lead-form";
import { Quiz } from "./quiz";
import { ReadCard, StickyRead, type Read } from "./read-card";
import { Result } from "./result";
import { Shell } from "./shell";
import { StartScreen, type Resumable } from "./start-screen";

type Phase = "start" | "quiz" | "gate" | "scoring" | "result" | "error";
type ResultPayload = { assessment: Assessment };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const [key, value] of params.entries())
    if (key.startsWith("utm_") || key === "ref" || key === "gclid") utm[key] = value.slice(0, 200);
  return utm;
}

// ── Saved progress ──────────────────────────────────────────────────────────

const STORAGE_KEY = "tac.exposurecheck.state.v1";

const savedSchema = z.object({
  version: z.literal(1),
  schema: z.string(),
  savedAt: z.string(),
  phase: z.enum(["quiz", "gate", "result"]),
  quizIndex: z.number().int().min(0),
  answers: answersSchema,
  lead: leadSchema.nullable(),
  result: z.object({ assessment: assessmentSchema }).nullable(),
});
type Saved = z.infer<typeof savedSchema>;

/** Fingerprint of the questions and bands, so saved state from an older version is discarded. */
const SCHEMA_HASH = (() => {
  const source = [
    `gate:${GATE_MODE}`,
    QUESTIONS.map(
      (q) => `${q.id}:${q.type}:${(q.options ?? []).map((o) => o.value).join("+")}`,
    ).join("|"),
    BANDS.map((b) => `${b.id}:${b.name}`).join("|"),
  ].join("~");
  let hash = 5381;
  for (let i = 0; i < source.length; i += 1) hash = ((33 * hash) ^ source.charCodeAt(i)) >>> 0;
  return hash.toString(36);
})();

function storage() {
  try {
    if (!window.localStorage) return null;
    const probe = "__tac_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

function clearSaved() {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {}
}

function loadSaved(): Saved | null {
  const store = storage();
  if (!store) return null;
  let raw: string | null = null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = savedSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.schema !== SCHEMA_HASH) {
      clearSaved();
      return null;
    }
    const saved = parsed.data;
    const lastIndex = QUESTIONS.length - 1;
    if (saved.phase === "result" && !saved.result) {
      clearSaved();
      return null;
    }
    if (saved.quizIndex > lastIndex) return { ...saved, quizIndex: lastIndex };
    return saved;
  } catch {
    clearSaved();
    return null;
  }
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// ── Main flow ───────────────────────────────────────────────────────────────

export function ExposureCheck({
  gateMode,
  isEmbedded = false,
}: {
  gateMode?: GateMode;
  isEmbedded?: boolean;
}) {
  const mode = gateMode ?? GATE_MODE;
  const [phase, setPhase] = useState<Phase>("start");
  const [answers, setAnswers] = useState<Answers>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [lead, setLead] = useState<Lead | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resumable, setResumable] = useState<Resumable | null>(null);
  const pushedHistory = useRef(false);
  const readRef = useRef<HTMLDivElement>(null);

  const read: Read = useMemo(() => {
    const s = score(answers);
    return {
      band: s.band,
      points: s.points,
      maxPoints: MAX_POINTS,
      coverage: s.answered / SCORED_QUESTIONS.length,
      started: s.answered > 0,
    };
  }, [answers]);

  useIsomorphicLayoutEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setAnswers(saved.answers);
      setQuizIndex(saved.quizIndex);
      setLead(saved.lead);
      setResult(saved.result);
      setResumable(saved.phase);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const savedPhase =
      phase === "result"
        ? "result"
        : phase === "gate"
          ? "gate"
          : phase === "quiz" || phase === "scoring" || phase === "error"
            ? "quiz"
            : null;
    const hasData = !!lead || !!result || Object.keys(answers).length > 0;
    if (!savedPhase || !hasData) return;
    const store = storage();
    if (!store) return;
    try {
      const saved: Saved = {
        version: 1,
        schema: SCHEMA_HASH,
        savedAt: new Date().toISOString(),
        phase: savedPhase,
        quizIndex,
        answers,
        lead,
        result,
      };
      store.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {}
  }, [hydrated, phase, quizIndex, answers, lead, result]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [phase, quizIndex]);

  const runAssessment = useCallback(
    async (current: Answers, currentLead: Lead | null) => {
      setPhase("scoring");
      setError(null);
      const started = Date.now();
      try {
        const payload = await postJson<ResultPayload>("/api/assess", {
          answers: current,
          lead: currentLead ?? undefined,
          gateMode: mode,
          utm: readUtm(),
        });
        // Keep the "preparing" state on screen long enough to read.
        const elapsed = Date.now() - started;
        if (elapsed < 1100) await new Promise((r) => setTimeout(r, 1100 - elapsed));
        setResult(payload);
        setPhase("result");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "We were unable to prepare your result at this time.",
        );
        setPhase("error");
      }
    },
    [mode],
  );

  const captureLead = useCallback(
    (next: Lead, current: Answers) => {
      setLead(next);
      postJson("/api/lead", { lead: next, answers: current, gateMode: mode, utm: readUtm() }).catch(
        (err) => console.error("[exposure-check] lead capture failed", err),
      );
    },
    [mode],
  );

  function resetProgress() {
    clearSaved();
    setAnswers({});
    setQuizIndex(0);
    setResult(null);
    setResumable(null);
  }

  function handleStartLead(next: Lead) {
    setSubmitting(true);
    captureLead(next, answers);
    setSubmitting(false);
    if (resumable) resetProgress();
    setPhase("quiz");
  }

  async function handleGateLead(next: Lead) {
    setSubmitting(true);
    captureLead(next, answers);
    setSubmitting(false);
    await runAssessment(answers, next);
  }

  function backToStart() {
    if (phase === "start") return;
    setResumable(result ? "result" : "quiz");
    setPhase("start");
  }

  function startOver() {
    resetProgress();
    setError(null);
    setPhase(mode === "first" ? "quiz" : "start");
  }

  // Let the browser back button return to the start screen.
  useEffect(() => {
    if (phase === "start" || pushedHistory.current) return;
    pushedHistory.current = true;
    window.history.pushState({ magnet: "inside" }, "");
  }, [phase]);

  useEffect(() => {
    function onPopState() {
      pushedHistory.current = false;
      backToStart();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  });

  const progress = phase === "quiz" ? { answered: quizIndex + 1, total: QUESTIONS.length } : undefined;

  return (
    <MotionConfig reducedMotion="user">
      {phase === "start" && (
        <StartScreen
          mode={mode}
          submitting={submitting}
          onSubmit={handleStartLead}
          onStart={() => setPhase("quiz")}
          resumable={resumable}
          resumeIndex={quizIndex}
          onResume={() => {
            if (!resumable) return;
            pushedHistory.current = false;
            setPhase(resumable);
            setResumable(null);
          }}
          isEmbedded={isEmbedded}
        />
      )}
      {phase !== "start" && (
        <Shell isEmbedded={isEmbedded} width={phase === "result" ? "result" : "quiz"}>
          {(phase === "quiz" || phase === "gate" || phase === "scoring") && (
            <div className="mx-auto w-full max-w-2xl">
              <div ref={readRef}>
                <ReadCard
                  read={read}
                  state={phase === "scoring" ? "working" : "reading"}
                  progress={progress}
                />
              </div>
              <StickyRead read={read} progress={progress} watch={readRef} />
              <div className="mt-5 sm:mt-6">
                {phase === "quiz" && (
                  <Quiz
                    answers={answers}
                    onChange={setAnswers}
                    onComplete={(final) => {
                      setAnswers(final);
                      if (mode === "last") setPhase("gate");
                      else void runAssessment(final, lead);
                    }}
                    onBack={backToStart}
                    onIndexChange={setQuizIndex}
                    startIndex={quizIndex}
                  />
                )}
                {phase === "gate" && (
                  <LeadForm
                    framing="verify"
                    submitting={submitting}
                    onSubmit={handleGateLead}
                    onBack={() => setPhase("quiz")}
                  />
                )}
                {phase === "scoring" && <Preparing />}
              </div>
              {(phase === "quiz" || phase === "gate") && Object.keys(answers).length > 0 && (
                <div className="mt-3 text-center">
                  <Button variant="ghost" size="sm" onClick={startOver}>
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Start over
                  </Button>
                </div>
              )}
            </div>
          )}

          {phase === "error" && (
            <div className="mx-auto w-full max-w-lg rounded-[18px] border border-[var(--line)] bg-white p-7 text-center shadow-[var(--shadow-card)]">
              <h2 className="tac-heading text-[1.375rem]">That request did not complete</h2>
              <p className="mt-3 text-base text-[var(--ink-soft)]">
                {error} Your answers have been retained, so you can try again in one click.
              </p>
              <Button className="mt-5" onClick={() => void runAssessment(answers, lead)}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            </div>
          )}

          {phase === "result" && result && (
            <div className="mx-auto w-full max-w-4xl">
              <Result
                assessment={result.assessment}
                answers={answers}
                firstName={lead?.firstName}
                lastName={lead?.lastName}
                email={lead?.email}
                company={lead?.company}
              />
              <div className="no-print mt-10 text-center">
                <Button variant="ghost" size="sm" onClick={startOver}>
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Start over
                </Button>
              </div>
            </div>
          )}
        </Shell>
      )}
    </MotionConfig>
  );
}

function Preparing() {
  const reduced = useReducedMotion();
  return (
    <div
      className="mx-auto w-full max-w-2xl rounded-[18px] border border-[var(--line)] bg-white px-6 py-8 text-center shadow-[var(--shadow-card)] sm:py-12"
      aria-live="polite"
    >
      <div className="mx-auto flex h-4 items-center justify-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
            animate={reduced ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: 0.13 * i, ease: "easeInOut" }}
          />
        ))}
      </div>
      <h2 className="tac-heading mt-6 text-[1.375rem] sm:text-[1.5625rem]">Preparing your result</h2>
      <ul className="mx-auto mt-4 grid max-w-sm gap-2 text-left">
        <AnimatePresence initial={false}>
          {[
            "Reviewing your ten answers",
            "Applying the 2026 IRS rules and amounts",
            "Identifying the findings behind your exposure",
          ].map((line, i) => (
            <motion.li
              key={line}
              className="text-base text-[var(--ink-soft)]"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + 0.28 * i, duration: 0.3 }}
            >
              {line}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
