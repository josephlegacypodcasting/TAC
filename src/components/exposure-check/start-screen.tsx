"use client";

import { RotateCw } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

import { Button } from "@/components/ui";
import { BRAND, GATE_COPY, PRODUCT, QUESTIONS, SITE_URL, type GateMode } from "@/lib/content";
import type { Lead } from "@/lib/schemas";

import { LeadForm } from "./lead-form";
import { ExposureMeter } from "./meter";
import { Footer } from "./shell";

export type Resumable = "quiz" | "gate" | "result";

export function StartScreen({
  mode,
  submitting,
  onSubmit,
  onStart,
  resumable,
  resumeIndex,
  onResume,
  isEmbedded = false,
}: {
  mode: GateMode;
  submitting: boolean;
  onSubmit: (lead: Lead) => void;
  onStart: () => void;
  resumable: Resumable | null;
  resumeIndex: number;
  onResume: () => void;
  isEmbedded?: boolean;
}) {
  const copy = GATE_COPY.unlock;
  return (
    <div className="tac-canvas relative flex min-h-screen flex-col overflow-hidden">
      {!isEmbedded && (
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-8">
          <a href={SITE_URL} className="shrink-0" aria-label={BRAND}>
            <Image
              src="/tac-logo.png"
              alt={BRAND}
              width={801}
              height={408}
              priority
              className="h-14 w-auto sm:h-[4.5rem]"
            />
          </a>
          <p className="hidden text-[0.8125rem] font-semibold text-[var(--ink-faint)] sm:block">
            {PRODUCT}
          </p>
        </div>
      )}
      <motion.div
        className="relative mx-auto grid w-full max-w-6xl flex-1 content-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-x-14 lg:gap-y-8 lg:py-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="flex items-center gap-2.5 text-[0.8125rem] font-semibold tracking-[0.02em] text-[var(--accent-deep)]">
            <span aria-hidden className="h-[3px] w-6 rounded-full bg-[var(--gold)]" />
            For staffing firm leadership
          </p>
          <h1 className="tac-display mt-4 max-w-[16ch]">
            Find out your ACA compliance exposure in under 3 minutes.
          </h1>
          <p className="tac-lede mt-5 max-w-[44ch] [text-wrap:balance]">
            Many staffing firms believe their ACA process is compliant. Ten questions show whether
            yours would hold up if the IRS asked.
          </p>
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-lift)] ring-1 ring-[var(--rule)]">
            <div className="border-b border-[var(--rule)] px-6 py-5 sm:px-8">
              <p className="text-[0.8125rem] font-medium text-[var(--ink-faint)]">{copy.eyebrow}</p>
              <p className="tac-heading mt-1.5 text-[1.3125rem] [text-wrap:balance]">
                {copy.heading}
              </p>
            </div>
            <div className="px-6 pt-6 pb-7 sm:px-8">
              {mode === "first" ? (
                <LeadForm
                  framing="unlock"
                  submitting={submitting}
                  onSubmit={onSubmit}
                  showIntro={false}
                  bare
                />
              ) : (
                <Button size="lg" onClick={onStart} className="w-full">
                  {copy.action}
                </Button>
              )}
              {resumable && (
                <ResumeBar resumable={resumable} resumeIndex={resumeIndex} onResume={onResume} />
              )}
            </div>
          </div>
        </div>

        <figure className="min-w-0 max-w-[560px] rounded-[var(--radius-lg)] bg-white/80 p-5 ring-1 ring-[var(--rule-strong)] backdrop-blur-sm sm:p-6 lg:col-start-1 lg:row-start-2 lg:self-start">
          <figcaption className="flex items-baseline justify-between gap-3">
            <span className="text-[0.8125rem] font-semibold text-[var(--ink)]">
              What your result looks like
            </span>
            <span className="text-[0.75rem] font-medium text-[var(--ink-faint)]">Sample</span>
          </figcaption>
          <div className="mt-4 grid gap-5 sm:grid-cols-[0.8fr_1fr] sm:items-center sm:gap-6">
            <div className="min-w-0">
              <p className="text-[1.125rem] font-bold text-[var(--medium-ink)]">Medium exposure</p>
              <ExposureMeter
                points={11}
                band="medium"
                state="settled"
                size="sm"
                className="mt-3"
                ariaLabel="Sample result: medium exposure"
              />
            </div>
            <div className="min-w-0 border-t border-[var(--rule)] pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
              <p className="text-[0.75rem] font-semibold text-[var(--ink-faint)]">Finding 01</p>
              <p className="mt-1 text-[0.9375rem] font-semibold text-[var(--ink)]">
                A preventive care plan only
              </p>
              <p className="mt-1 text-[0.8125rem] leading-snug text-[var(--ink-soft)]">
                It does not provide minimum value, so each full-time associate who obtains a premium
                tax credit may trigger a 2026 amount of $5,010 a year.
              </p>
              <p className="mt-3 text-[0.8125rem] text-[var(--ink-soft)]">
                <span className="font-semibold text-[var(--ink)]">Illustrative estimate:</span>{" "}
                <span className="whitespace-nowrap">about $160,000 a year</span>
              </p>
            </div>
          </div>
        </figure>
      </motion.div>
      {!isEmbedded && <Footer width="front" className="relative bg-white/60 backdrop-blur-sm" />}
    </div>
  );
}

function ResumeBar({
  resumable,
  resumeIndex,
  onResume,
}: {
  resumable: Resumable;
  resumeIndex: number;
  onResume: () => void;
}) {
  const done = resumable === "result";
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t border-[var(--rule)] pt-4">
      <p className="text-[0.875rem] leading-snug text-[var(--ink-faint)]">
        {done
          ? "You have completed this check previously."
          : `You had reached question ${Math.min(resumeIndex + 1, QUESTIONS.length)} of ${QUESTIONS.length}.`}
      </p>
      <Button variant="secondary" size="sm" onClick={onResume}>
        <RotateCw className="h-3.5 w-3.5" aria-hidden />
        {done ? "View my result" : "Continue where I left off"}
      </Button>
    </div>
  );
}
