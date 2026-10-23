import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-base font-semibold tracking-[-0.005em] transition-colors duration-150 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--btn)] text-[var(--ink-onbtn)] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_20px_-10px_rgba(14,60,85,0.55)] hover:bg-[var(--btn-hover)] disabled:bg-[var(--wash)] disabled:text-[var(--ink-faint)] disabled:shadow-none",
        secondary:
          "bg-white text-[var(--ink)] ring-1 ring-[var(--rule-strong)] ring-inset hover:bg-[var(--wash)] hover:ring-[var(--line-strong)]",
        ghost:
          "text-[var(--ink-soft)] hover:bg-[var(--wash)] hover:text-[var(--ink)]",
        link: "text-[var(--accent-deep)] underline underline-offset-4 hover:text-[var(--accent)]",
        onBand: "bg-white text-[var(--ink)] hover:bg-[var(--accent-soft)]",
      },
      size: {
        sm: "h-11 px-3.5 text-sm sm:h-9",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base sm:h-13 sm:px-7",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius)] bg-white px-3.5 text-base text-[var(--ink)] ring-1 ring-[var(--rule-strong)] ring-inset transition-colors placeholder:text-[var(--ink-faint)] hover:ring-[var(--line-strong)] focus:bg-white focus:ring-[1.5px] focus:ring-[var(--accent)] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-[0.8125rem] font-semibold text-[var(--ink-soft)]", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-[var(--radius)] bg-white pr-10 pl-3.5 text-base text-[var(--ink)] ring-1 ring-[var(--rule-strong)] ring-inset transition-colors hover:ring-[var(--line-strong)] focus:ring-[1.5px] focus:ring-[var(--accent)] focus:outline-none invalid:text-[var(--ink-faint)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
      >
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
