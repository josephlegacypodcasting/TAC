"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

import { ADDRESS, BRAND, PHONE, PRODUCT, SITE_URL } from "@/lib/content";
import { cn } from "@/lib/utils";

export const WIDTHS = {
  front: "mx-auto w-full max-w-6xl px-5 sm:px-8",
  quiz: "mx-auto w-full max-w-[44.5rem] px-5 sm:max-w-[46rem] sm:px-8",
  result: "mx-auto w-full max-w-[58.5rem] px-5 sm:max-w-[60rem] sm:px-8",
};
type Width = keyof typeof WIDTHS;

export function Shell({
  isEmbedded,
  width,
  children,
}: {
  isEmbedded: boolean;
  width: Width;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {!isEmbedded && (
        <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
          <div className={cn(WIDTHS[width], "flex items-center justify-between gap-4 py-3")}>
            <a href={SITE_URL} className="shrink-0" aria-label={BRAND}>
              <Image
                src="/tac-logo.png"
                alt={BRAND}
                width={801}
                height={408}
                priority
                className="h-12 w-auto sm:h-14"
              />
            </a>
            <span className="hidden text-[0.8125rem] font-medium text-[var(--ink-faint)] sm:block">
              {PRODUCT}
            </span>
          </div>
        </header>
      )}
      <main className="flex-1 py-8 sm:py-12">
        <div className={WIDTHS[width]}>{children}</div>
      </main>
      {!isEmbedded && <Footer width={width} />}
    </div>
  );
}

const footerLink =
  "font-medium text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--ink)] hover:underline";

const noSubscribe = () => () => {};

export function Footer({ width, className = "" }: { width: Width; className?: string }) {
  // Read the year on the client only, so the prerendered page never bakes in a stale one.
  const year = useSyncExternalStore(
    noSubscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return (
    <footer className={cn("border-t border-[var(--rule)] py-6", className)}>
      <div
        className={cn(
          WIDTHS[width],
          "flex flex-wrap items-center justify-between gap-3 text-[0.8125rem] text-[var(--ink-faint)]",
        )}
      >
        <span>
          © {year ?? ""} {BRAND}. <span className="hidden sm:inline">{ADDRESS}</span>
        </span>
        <span className="flex items-center gap-4">
          <a href={`tel:+1${PHONE.replace(/-/g, "")}`} className={footerLink}>
            {PHONE}
          </a>
          <a href={SITE_URL} className={footerLink}>
            tacbenefitsgroup.com
          </a>
        </span>
      </div>
    </footer>
  );
}
