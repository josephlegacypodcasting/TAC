"use client";

import { motion, useReducedMotion } from "motion/react";

import type { Band } from "@/lib/schemas";
import { MAX_POINTS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const SEGMENTS: { id: Band; label: string; from: number; to: number }[] = [
  { id: "low", label: "Low", from: 0, to: 5 },
  { id: "medium", label: "Medium", from: 6, to: 13 },
  { id: "high", label: "High", from: 14, to: MAX_POINTS },
];

const SOLID: Record<Band, string> = {
  low: "bg-[var(--low)]",
  medium: "bg-[var(--medium)]",
  high: "bg-[var(--high)]",
};
const SOFT: Record<Band, string> = {
  low: "bg-[var(--low-soft)]",
  medium: "bg-[var(--medium-soft)]",
  high: "bg-[var(--high-soft)]",
};
export const BAND_INK: Record<Band, string> = {
  low: "text-[var(--low-ink)]",
  medium: "text-[var(--medium-ink)]",
  high: "text-[var(--high-ink)]",
};
const RING: Record<Band, string> = {
  low: "ring-[var(--low)]",
  medium: "ring-[var(--medium)]",
  high: "ring-[var(--high)]",
};

/** Marker position (0–1) within the band's third of the bar. */
function markerPosition(points: number, band: Band) {
  const index = SEGMENTS.findIndex((s) => s.id === band);
  const seg = SEGMENTS[index];
  const clamped = Math.min(seg.to, Math.max(seg.from, points));
  const within = seg.to === seg.from ? 0.5 : (clamped - seg.from) / (seg.to - seg.from);
  return (index + 0.12 + 0.76 * within) / 3;
}

export function ExposureMeter({
  points,
  band,
  state,
  size = "md",
  started = true,
  className,
  ariaLabel,
}: {
  points: number;
  band: Band;
  state: "reading" | "working" | "settled";
  size?: "md" | "sm" | "xs";
  started?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();
  const position = markerPosition(points, band);

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel ?? (started ? `Exposure: ${band}` : "Exposure not yet assessed")}
    >
      <div className="relative">
        <div
          className={cn(
            "grid grid-cols-3 gap-1",
            size === "md" ? "h-3" : size === "sm" ? "h-2.5" : "h-2",
          )}
        >
          {SEGMENTS.map((s) => {
            const active = started && s.id === band;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-full transition-colors duration-500",
                  active ? SOLID[s.id] : started ? SOFT[s.id] : "bg-[var(--rule)]",
                )}
              />
            );
          })}
        </div>
        {started && (
          <div className="absolute inset-x-[10px] top-1/2">
            <motion.div
              className="absolute top-0"
              initial={false}
              animate={{ left: `${100 * position}%` }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }}
            >
              <span className="absolute top-0 left-0 block -translate-x-1/2 -translate-y-1/2">
                {state !== "settled" && (
                  <span
                    aria-hidden
                    className={cn("tac-halo absolute inset-[-5px] rounded-full ring-2", RING[band])}
                  />
                )}
                <span
                  className={cn(
                    "block rounded-full bg-white shadow-[0_2px_8px_rgba(14,60,85,0.35)] ring-[3px] ring-[var(--ink)]",
                    size === "md" ? "h-5 w-5" : size === "sm" ? "h-4 w-4" : "h-3.5 w-3.5",
                  )}
                />
              </span>
            </motion.div>
          </div>
        )}
      </div>
      {size !== "xs" && (
        <div className="mt-2.5 grid grid-cols-3 gap-1">
          {SEGMENTS.map((s) => {
            const active = started && s.id === band;
            return (
              <span
                key={s.id}
                className={cn(
                  "text-center text-[0.8125rem] leading-none",
                  active ? cn("font-bold", BAND_INK[s.id]) : "font-medium text-[var(--ink-faint)]",
                )}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
