import { z } from "zod";

export const answersSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);
export type Answers = z.infer<typeof answersSchema>;

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
  gateMode: z.string().max(20).optional(),
  utm: z.record(z.string(), z.string()).optional(),
});

export const leadRequestSchema = z.object({
  lead: leadSchema,
  answers: answersSchema.optional(),
  gateMode: z.string().max(20).optional(),
  utm: z.record(z.string(), z.string()).optional(),
});
