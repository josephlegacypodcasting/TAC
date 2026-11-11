import { z } from "zod";

import { QUESTIONS } from "./content";

/**
 * Answers keyed by question id. Only known questions are accepted, and each
 * value must be one of that question's options, so arbitrary data never
 * reaches the scoring or the CRM payload.
 */
export const answersSchema = z
  .record(z.string(), z.union([z.string().max(500), z.array(z.string().max(100)).max(20)]))
  .superRefine((answers, ctx) => {
    for (const [id, value] of Object.entries(answers)) {
      const question = QUESTIONS.find((q) => q.id === id);
      if (!question) {
        ctx.addIssue({ code: "custom", path: [id], message: "Unknown question" });
        continue;
      }
      if (question.type === "text") {
        if (typeof value !== "string")
          ctx.addIssue({ code: "custom", path: [id], message: "Expected text" });
        continue;
      }
      const allowed = new Set((question.options ?? []).map((o) => o.value));
      const values = Array.isArray(value) ? value : [value];
      const shapeOk = question.type === "multi" ? Array.isArray(value) : typeof value === "string";
      if (!shapeOk || values.some((v) => !allowed.has(v)))
        ctx.addIssue({ code: "custom", path: [id], message: "Unknown option" });
    }
  });
export type Answers = z.infer<typeof answersSchema>;

const UTM_KEY = /^(utm_[a-z0-9_]{1,40}|ref|gclid)$/;

/**
 * Tracking parameters. Keys outside utm_*, ref and gclid are dropped, so they
 * cannot overwrite lead fields (email, event…) in the flattened webhook payload.
 */
export const utmSchema = z
  .record(z.string().max(60), z.string())
  .refine((utm) => Object.keys(utm).length <= 30)
  .transform((utm) =>
    Object.fromEntries(
      Object.entries(utm)
        .filter(([key]) => UTM_KEY.test(key))
        .map(([key, value]) => [key, value.slice(0, 200)]),
    ),
  );

export const ROLES = [
  { value: "ceo", label: "CEO, President or Owner" },
  { value: "cfo", label: "CFO or finance leader" },
  { value: "hr", label: "Head of HR or Benefits" },
  { value: "ops", label: "Operations or branch leader" },
  { value: "advisor", label: "Advisor or consultant" },
] as const;

export const leadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(1).max(160),
  role: z.enum(["ceo", "cfo", "hr", "ops", "advisor"]),
});
export type Lead = z.infer<typeof leadSchema>;

export const driverSchema = z.object({
  key: z.string(),
  title: z.string(),
  line: z.string(),
});
export type Driver = z.infer<typeof driverSchema>;

export const bandSchema = z.enum(["low", "medium", "high"]);
export type Band = z.infer<typeof bandSchema>;

export const assessmentSchema = z.object({
  band: bandSchema,
  points: z.number().int().min(0),
  maxPoints: z.number().int().min(1),
  headline: z.string(),
  explanation: z.string(),
  settledBy: z.enum(["total", "trigger", "floor", "uncertainty"]),
  drivers: z.array(driverSchema),
  strengths: z.array(z.string()),
  nextStep: z.string(),
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const assessRequestSchema = z.object({
  answers: answersSchema,
  lead: leadSchema.optional(),
  gateMode: z.enum(["first", "last", "off"]).optional(),
  utm: utmSchema.optional(),
});

export const leadRequestSchema = z.object({
  lead: leadSchema,
  answers: answersSchema.optional(),
  gateMode: z.enum(["first", "last", "off"]).optional(),
  utm: utmSchema.optional(),
});
