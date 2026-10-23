"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui";
import {
  answerLabel,
  bandInfo,
  CONTACT_EMAIL,
  CTA_URL,
  ESTIMATE_COPY,
  PRODUCT,
  PROOF_STATS,
  STAFFING_EDGE_STATS,
  TESTIMONIAL,
} from "@/lib/content";
import type { Answers, Assessment } from "@/lib/schemas";
import { estimate, pick } from "@/lib/scoring";
import { cn } from "@/lib/utils";

import { BAND_INK, ExposureMeter } from "./meter";

const NUMBER_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven"];

const reveal = (step: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + 0.12 * step, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
});

function formatAmount(amount: number) {
  if (amount >= 1_000_000) {
    const millions = Math.round(amount / 100_000) / 10;
    return `$${millions.toLocaleString("en-US")} million`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export function Result({
  assessment,
  answers,
  firstName,
  lastName,
  company,
}: {
  assessment: Assessment;
  answers: Answers;
  firstName?: string;
  lastName?: string;
  company?: string;
}) {
  const band = bandInfo(assessment.band);
  const shown = assessment.drivers.slice(0, 4);
  const hidden = assessment.drivers.length - shown.length;
  const [share, setShare] = useState(0.25);
  const est = useMemo(
    () => (assessment.band === "low" ? null : estimate(answers, share)),
    [answers, share, assessment.band],
  );
  const largest = pick(answers, "associates") === "gte5000";
  const sharePct = Math.round(100 * share);
  const preparedFor = [[firstName, lastName].filter(Boolean).join(" "), company]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-10 sm:gap-12">
      <motion.section
        {...reveal(0)}
        className="rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)] ring-1 ring-[var(--rule)]"
      >
        <div className="p-6 sm:p-9">
          <p className="border-b border-[var(--rule)] pb-4 text-[0.8125rem] font-medium text-[var(--ink-faint)]">
            {PRODUCT}
            {preparedFor && <> · Prepared for {preparedFor}</>}
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.35fr_1fr] md:items-start md:gap-9">
            <div className="min-w-0">
              <h1 className="tac-h2 text-[clamp(1.75rem,1.3rem+1.9vw,2.625rem)]">
                {assessment.headline}
              </h1>
              <p className="tac-lede mt-4 max-w-[60ch]">{assessment.explanation}</p>
              {assessment.band === "low" && assessment.drivers.length === 0 && (
                <p className="mt-4 text-[1.0625rem] font-semibold text-[var(--low-ink)]">
                  Your responses do not indicate a material penalty exposure.
                </p>
              )}
            </div>
            <div className="order-first min-w-0 rounded-[var(--radius)] bg-[var(--wash)] p-5 md:order-none">
              <p className="text-[0.8125rem] font-semibold text-[var(--ink-faint)]">Your exposure</p>
              <p
                className={cn(
                  "tac-figure mt-2 text-[2.5rem] sm:text-[2.875rem]",
                  BAND_INK[assessment.band],
                )}
              >
                {band.name.replace(" exposure", "")}
              </p>
              <ExposureMeter
                points={assessment.points}
                band={assessment.band}
                state="settled"
                className="mt-5"
              />
              <p className="mt-4 text-[0.875rem] leading-snug text-[var(--ink-soft)]">
                {band.summary}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {shown.length > 0 && (
        <motion.section {...reveal(1)} aria-labelledby="findings">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <h2 id="findings" className="tac-h2">
              {shown.length === 1
                ? "The finding behind your result"
                : `The ${NUMBER_WORDS[shown.length]} findings behind your result`}
            </h2>
            <p className="text-[0.875rem] text-[var(--ink-faint)]">Most significant first</p>
          </div>
          <ol className="mt-5 border-b border-[var(--rule)]">
            {shown.map((driver, i) => (
              <li
                key={driver.key}
                className="grid gap-2 border-t border-[var(--rule)] py-5 sm:grid-cols-[3.25rem_1fr] sm:gap-5 sm:py-6"
              >
                <span
                  className={cn(
                    "tac-figure text-[1.375rem] sm:text-[1.5rem]",
                    i === 0 ? BAND_INK[assessment.band] : "text-[var(--ink-faint)]",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="tac-heading text-[1.125rem]">{driver.title}</h3>
                  <p className="mt-1.5 max-w-[68ch] text-[0.9375rem] leading-relaxed text-[var(--ink-soft)] sm:text-base">
                    {driver.line}
                  </p>
                  <p className="mt-2.5 text-[0.8125rem] leading-snug text-[var(--ink-faint)]">
                    You answered: {answerLabel(driver.key)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          {hidden > 0 && (
            <p className="mt-3 text-[0.875rem] text-[var(--ink-faint)]">
              {hidden === 1
                ? "One further finding is"
                : `${NUMBER_WORDS[hidden] ? NUMBER_WORDS[hidden][0].toUpperCase() + NUMBER_WORDS[hidden].slice(1) : hidden} further findings are`}{" "}
              covered in your compliance review.
            </p>
          )}
        </motion.section>
      )}

      {est && (
        <motion.section {...reveal(2)} aria-labelledby="estimate">
          <h2 id="estimate" className="tac-h2">
            Illustrative estimate at 2026 IRS amounts
          </h2>
          <div className="mt-5 grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-semibold text-[var(--ink-soft)]">
                {ESTIMATE_COPY.scenarios[est.scenario].label}
              </p>
              {est.amount > 0 ? (
                <>
                  <p className="tac-figure mt-3 text-[clamp(2.25rem,1.7rem+2.2vw,3.375rem)] text-[var(--ink)]">
                    <span className="mr-1 align-[0.3em] text-[0.4em] font-semibold tracking-normal text-[var(--ink-faint)]">
                      about
                    </span>{" "}
                    <span className="whitespace-nowrap">{formatAmount(est.amount)}</span>{" "}
                    <span className="ml-2 text-[1rem] font-semibold tracking-normal text-[var(--ink-faint)]">
                      a year
                    </span>
                  </p>
                  <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
                    {ESTIMATE_COPY.scenarios[est.scenario].detail(est.fullTime)}
                  </p>
                </>
              ) : (
                <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-[var(--ink-soft)]">
                  {ESTIMATE_COPY.belowThreshold}
                </p>
              )}
            </div>
            <div className="min-w-0 rounded-[var(--radius)] bg-[var(--wash)] p-5">
              <label htmlFor="ftshare" className="flex items-baseline justify-between gap-3">
                <span className="text-[0.875rem] font-semibold text-[var(--ink)]">
                  Associates working full-time hours
                </span>
                <span className="tac-figure text-[1.25rem] text-[var(--ink)]">{sharePct}%</span>
              </label>
              <input
                id="ftshare"
                type="range"
                min={10}
                max={50}
                step={5}
                value={sharePct}
                onChange={(e) => setShare(Number(e.target.value) / 100)}
                className="tac-range mt-1 w-full"
                style={{ "--pct": `${((sharePct - 10) / 40) * 100}%` } as React.CSSProperties}
                aria-describedby="ftshare-help"
              />
              <p id="ftshare-help" className="text-[0.8125rem] leading-snug text-[var(--ink-faint)]">
                {largest
                  ? `An assumption, applied to an assumed ${est.associates.toLocaleString("en-US")} associates. Adjust it to your firm.`
                  : `An assumption, applied to ${est.associates.toLocaleString("en-US")} associates, the middle of the range you selected. Adjust it to your firm.`}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-[88ch] text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">
            {ESTIMATE_COPY.framing}{" "}
            {est.scenario === "reporting" || est.scenario === "furnishing"
              ? ESTIMATE_COPY.footnoteForms
              : ESTIMATE_COPY.footnote}
          </p>
        </motion.section>
      )}

      {assessment.strengths.length > 0 && (
        <motion.section {...reveal(3)} aria-labelledby="strengths">
          <h2 id="strengths" className="tac-heading text-[1.125rem]">
            Already in order
          </h2>
          <ul className="mt-3 grid gap-x-8 gap-y-2 text-[0.9375rem] text-[var(--ink-soft)] sm:grid-cols-2">
            {assessment.strengths.map((s) => (
              <li key={s} className="border-t border-[var(--rule)] pt-2">
                {s}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <motion.section
        {...reveal(4)}
        className="tac-band no-print relative overflow-hidden rounded-[var(--radius-lg)] p-7 sm:p-10"
        aria-labelledby="next"
      >
        <div className="relative grid gap-9 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-semibold text-[var(--ink-onnavy-soft)]">
              Your next step
            </p>
            <h2
              id="next"
              className="mt-3 max-w-[18ch] text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-white"
            >
              Challenge the status quo.
            </h2>
            <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-[var(--ink-onnavy-soft)] sm:text-[1.0625rem]">
              {assessment.nextStep}
            </p>
            <div className="mt-7 flex items-center gap-4">
              <Image
                src="/kieran-cleary.webp"
                alt="Kieran Cleary"
                width={214}
                height={300}
                loading="eager"
                className="h-16 w-16 shrink-0 rounded-full object-cover object-top ring-2 ring-white/25"
              />
              <div className="min-w-0 text-[0.9375rem] leading-snug">
                <p className="font-semibold text-white">Kieran Cleary</p>
                <p className="text-[var(--ink-onnavy-soft)]">Vice President, TAC Benefits Group</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all text-[var(--ink-onnavy-soft)] underline-offset-4 hover:text-white hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <Button
              asChild
              variant="onBand"
              size="lg"
              className="mt-7 h-auto w-full justify-center py-3.5 text-center sm:w-auto"
            >
              <a href={CTA_URL} target="_blank" rel="noopener noreferrer">
                <span className="sm:hidden">Book my compliance review</span>
                <span className="hidden sm:inline">Book my complimentary compliance review</span>
                <ArrowUpRight className="h-5 w-5" aria-hidden />
              </a>
            </Button>
          </div>
          <div className="border-y border-white/15 md:mt-2 md:self-start">
            <p className="py-3 text-[0.8125rem] font-semibold text-[var(--ink-onnavy-soft)]">
              StaffingEdge by TAC
            </p>
            <dl className="divide-y divide-white/15 border-t border-white/15">
              {STAFFING_EDGE_STATS.map((s) => (
                <div key={s.label} className="flex items-baseline gap-4 py-3.5">
                  <dt className="tac-figure w-16 shrink-0 text-[1.75rem] text-white">{s.value}</dt>
                  <dd className="text-[0.9375rem] leading-snug text-[var(--ink-onnavy-soft)]">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal(5)} className="grid gap-8 md:grid-cols-[1fr_1.15fr] md:gap-10">
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-semibold text-[var(--ink-faint)]">
            Benefits Built for Staffing
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {PROOF_STATS.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="tac-figure text-[1.5rem] text-[var(--ink)] sm:text-[1.875rem]">
                  {s.value}
                </dd>
                <dd className="mt-1 text-[0.8125rem] leading-tight text-[var(--ink-faint)]">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-[var(--rule)] pt-4 text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
            When Essential Staff Care left the market in 2025, thousands of staffing firms were left
            stranded. We stepped up. We built new options fast, provided strategic guidance, and we
            helped our clients avoid disruption. While others retreated, we delivered.
          </p>
        </div>
        <figure className="flex flex-col justify-between rounded-[var(--radius-lg)] bg-[var(--accent-soft)] p-6 sm:p-7">
          <blockquote className="text-[1.125rem] leading-relaxed font-medium text-[var(--ink)] sm:text-[1.25rem]">
            “{TESTIMONIAL.quote}”
          </blockquote>
          <figcaption className="mt-5 text-[0.875rem] text-[var(--ink-soft)]">
            <span className="font-semibold text-[var(--ink)]">{TESTIMONIAL.name}</span>,{" "}
            {TESTIMONIAL.title}
          </figcaption>
        </figure>
      </motion.section>

      <p className="text-[0.75rem] leading-relaxed text-[var(--ink-faint)]">
        This assessment is for general information only and does not constitute legal, tax or
        accounting advice. Results and estimates are illustrative, are based solely on your
        responses and on 2026 IRS figures, and are not a determination of liability.
      </p>
    </div>
  );
}
