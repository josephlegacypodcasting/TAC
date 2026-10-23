"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type RefObject } from "react";

import { bandInfo } from "@/lib/content";
import type { Band } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import { BAND_INK, ExposureMeter } from "./meter";

export type Read = {
  band: Band;
  points: number;
  maxPoints: number;
  coverage: number;
  started: boolean;
};
type Progress = { answered: number; total: number } | undefined;

/** Live provisional exposure shown above the questions. */
export function ReadCard({
  read,
  state,
  progress,
}: {
  read: Read;
  state: "reading" | "working";
  progress: Progress;
}) {
  const reduced = useReducedMotion();
  const band = bandInfo(read.band);
  return (
    <div className="relative rounded-[var(--radius-lg)] bg-white px-4 pt-3.5 pb-4 ring-1 ring-[var(--rule)] ring-inset sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="tac-eyebrow truncate">
          {state === "working" ? "Preparing your result" : "Provisional read"}
        </p>
        {progress && (
          <p className="shrink-0 text-sm font-medium text-[var(--ink-faint)] tabular-nums">
            Question {progress.answered} of {progress.total}
          </p>
        )}
      </div>
      <div className="mt-1 min-h-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={read.started ? read.band : "none"}
            className={cn(
              "text-[1.0625rem] font-bold tracking-[-0.01em]",
              read.started ? BAND_INK[read.band] : "text-[var(--ink-faint)]",
            )}
            initial={!reduced && { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {read.started ? (
              band.name
            ) : (
              <>
                <span className="sm:hidden">Appears as you answer</span>
                <span className="hidden sm:inline">Your exposure appears here as you answer</span>
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
      <ExposureMeter
        points={read.points}
        band={read.band}
        started={read.started}
        state={state}
        size="sm"
        className="mt-3"
      />
    </div>
  );
}

/** Compact bar pinned to the top once the read card scrolls out of view. */
export function StickyRead({
  read,
  progress,
  watch,
}: {
  read: Read;
  progress: Progress;
  watch: RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = watch.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [watch]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 top-0 z-40 border-b border-[var(--rule)] bg-white/92 backdrop-blur-md"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
        >
          <div className="mx-auto flex w-full max-w-[44.5rem] items-center gap-4 px-5 py-3 sm:max-w-[46rem] sm:gap-6 sm:px-8">
            <ExposureMeter
              points={read.points}
              band={read.band}
              started={read.started}
              state="reading"
              size="xs"
              className="min-w-0 flex-1 sm:max-w-[240px]"
            />
            <p
              className={cn(
                "min-w-0 shrink truncate text-[0.9375rem] font-semibold",
                read.started ? BAND_INK[read.band] : "text-[var(--ink-faint)]",
              )}
            >
              {read.started ? bandInfo(read.band).name : "Not yet assessed"}
            </p>
            {progress && (
              <p className="ml-auto shrink-0 text-sm font-medium text-[var(--ink-faint)] tabular-nums">
                {progress.answered}/{progress.total}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
