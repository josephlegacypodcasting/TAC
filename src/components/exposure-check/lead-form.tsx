"use client";

import { ArrowRight, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Button, Input, Label, Select } from "@/components/ui";
import { GATE_COPY, type GateFraming } from "@/lib/content";
import { leadSchema, ROLES, type Lead } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function LeadForm({
  framing,
  submitting,
  onSubmit,
  onBack,
  showIntro = true,
  bare = false,
}: {
  framing: GateFraming;
  submitting: boolean;
  onSubmit: (lead: Lead) => void;
  onBack?: () => void;
  showIntro?: boolean;
  bare?: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const copy = GATE_COPY[framing];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ firstName, lastName, email, company, role });
    if (parsed.success) {
      setError(null);
      onSubmit(parsed.data);
      return;
    }
    setError(
      !firstName.trim() || !lastName.trim()
        ? "Please provide your first and last name."
        : !leadSchema.shape.email.safeParse(email).success
          ? "That email address does not appear to be valid."
          : !company.trim()
            ? "Please provide your company name."
            : "Please select your role.",
    );
  }

  return (
    <motion.div
      className={cn("w-full", !bare && "mx-auto max-w-xl")}
      initial={!bare && { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {showIntro && (
        <div className="text-center">
          <p className="tac-eyebrow">{copy.eyebrow}</p>
          <h2 className="tac-display mt-3">{copy.heading}</h2>
          <p className="tac-lede mx-auto mt-4 max-w-lg">{copy.body}</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn(
          "grid gap-4",
          !bare &&
            "rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-[var(--rule)] ring-inset sm:p-6",
          !bare && showIntro && "mt-7",
        )}
      >
        {!showIntro && !bare && (
          <p className="tac-eyebrow border-b border-[var(--rule)] pb-3">Start here</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={error ? "gate-error" : undefined}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Your role</Label>
            <Select
              id="role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>
                Select
              </option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {error && (
          <p
            id="gate-error"
            role="alert"
            className="rounded-[var(--radius)] bg-[var(--high-soft)] px-3 py-2 text-sm font-semibold text-[var(--high-ink)]"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="mt-1 h-auto w-full py-3.5 whitespace-normal"
          disabled={submitting}
        >
          {submitting ? "One moment" : copy.action}
          {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
        <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{copy.reassurance}</span>
        </p>
      </form>
      {onBack && (
        <div className="mt-5 text-center">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </motion.div>
  );
}
