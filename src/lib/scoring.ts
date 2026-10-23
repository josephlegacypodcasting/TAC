import type { EstimateScenario } from "./content";
import type { Answers, Band } from "./schemas";

/** Points per answer. Questions not listed here (associates, specialty) are profile only. */
export const POINTS: Record<string, Record<string, number>> = {
  arrangement: { established: 0, moved2025: 1, renewing: 0, unsure: 2 },
  measurement: {
    lookback_admin: 0,
    lookback_internal: 1,
    monthly: 2,
    offer_all: 1,
    manual: 3,
    unsure: 4,
  },
  offerRate: { all: 0, nearly: 1, policy: 2, partial: 4, unsure: 3 },
  coverage: {
    mv_safeharbor: 0,
    mec_plus_mv: 1,
    mv_unsure: 2,
    mec_only: 3,
    none: 5,
    unsure: 3,
  },
  evidence: { recorded: 0, onboarding: 1, systemflag: 2, policy: 4, unsure: 3 },
  lifecycle: { automated: 0, newhire: 3, branch: 3, unsure: 2 },
  filing: { specialist: 0, payroll: 2, internal: 2, onrequest: 3, unsure: 3 },
  irsLetters: {
    none: 0,
    resolved_nopay: 1,
    resolved_paid: 3,
    open: 5,
    unsure: 2,
  },
};

export const SCORED_QUESTIONS = Object.keys(POINTS);
export const MAX_POINTS = SCORED_QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...Object.values(POINTS[q])),
  0,
);

export function pick(answers: Answers, id: string): string {
  const v = answers[id];
  return typeof v === "string" ? v : "";
}

type Rule = { id: string; test: (a: Answers) => boolean };

/** Any of these forces a high result regardless of total. */
const TRIGGERS: Rule[] = [
  { id: "irsLetters:open", test: (a) => pick(a, "irsLetters") === "open" },
  { id: "measurement:unsure", test: (a) => pick(a, "measurement") === "unsure" },
  { id: "offerRate:partial", test: (a) => pick(a, "offerRate") === "partial" },
  { id: "coverage:none", test: (a) => pick(a, "coverage") === "none" },
  {
    id: "offerRate:unsure",
    test: (a) =>
      pick(a, "offerRate") === "unsure" &&
      ["policy", "unsure"].includes(pick(a, "evidence")),
  },
];

/** Any of these lifts a low result to medium. */
const FLOORS: Rule[] = [
  { id: "coverage:mec_only", test: (a) => pick(a, "coverage") === "mec_only" },
  { id: "filing:onrequest", test: (a) => pick(a, "filing") === "onrequest" },
  {
    id: "irsLetters:resolved_paid",
    test: (a) => pick(a, "irsLetters") === "resolved_paid",
  },
  { id: "offerRate:policy", test: (a) => pick(a, "offerRate") === "policy" },
  { id: "offerRate:unsure", test: (a) => pick(a, "offerRate") === "unsure" },
  { id: "coverage:unsure", test: (a) => pick(a, "coverage") === "unsure" },
];

/** Answers that are moot when no coverage is offered at all. */
const MOOT_WITHOUT_COVERAGE = new Set([
  "offerRate",
  "evidence",
  "lifecycle",
  "measurement:offer_all",
  "measurement:lookback_admin",
  "arrangement:established",
  "filing:specialist",
]);

export type SettledBy = "total" | "trigger" | "floor" | "uncertainty";

export type Score = {
  band: Band;
  points: number;
  answered: number;
  drivers: string[];
  strengths: string[];
  settledBy: SettledBy;
  uncertain: number;
};

export function score(answers: Answers): Score {
  let points = 0;
  let answered = 0;
  let uncertain = 0;
  const findings: { key: string; pts: number; forced: boolean }[] = [];
  const strengths: string[] = [];

  for (const q of SCORED_QUESTIONS) {
    const value = pick(answers, q);
    if (!value || POINTS[q][value] === undefined) continue;
    answered += 1;
    const pts = POINTS[q][value];
    points += pts;
    if (value === "unsure") uncertain += 1;
    const key = `${q}:${value}`;
    const moot =
      pick(answers, "coverage") === "none" &&
      (MOOT_WITHOUT_COVERAGE.has(key) || MOOT_WITHOUT_COVERAGE.has(q));
    if (moot) continue;
    if (pts === 0) strengths.push(key);
    else findings.push({ key, pts, forced: false });
  }

  const triggered = TRIGGERS.filter((r) => r.test(answers)).map((r) => r.id);
  const floored = FLOORS.filter((r) => r.test(answers)).map((r) => r.id);

  let band: Band = points >= 14 ? "high" : points >= 6 ? "medium" : "low";
  let settledBy: SettledBy = "total";
  if (triggered.length > 0 && band !== "high") {
    band = "high";
    settledBy = "trigger";
  } else if (band === "low" && floored.length > 0) {
    band = "medium";
    settledBy = "floor";
  } else if (band === "low" && uncertain >= 3) {
    band = "medium";
    settledBy = "uncertainty";
  }

  const forced = new Set(
    settledBy === "trigger" ? triggered : settledBy === "floor" ? floored : [],
  );
  for (const f of findings) f.forced = forced.has(f.key);
  findings.sort(
    (a, b) => Number(b.forced) - Number(a.forced) || b.pts - a.pts,
  );

  return {
    band,
    points,
    answered,
    drivers: findings
      .filter((f) => f.pts >= 2 || f.forced || (band !== "low" && f.pts >= 1))
      .map((f) => f.key),
    strengths,
    settledBy,
    uncertain,
  };
}

/** Midpoint of each headcount range, used for the illustrative estimate. */
const ASSOCIATES_MIDPOINT: Record<string, number> = {
  lt200: 150,
  "200_499": 350,
  "500_1999": 1250,
  "2000_4999": 3500,
  gte5000: 6000,
};

export type Estimate = {
  scenario: EstimateScenario;
  associates: number;
  fullTime: number;
  amount: number;
};

export function estimate(answers: Answers, fullTimeShare = 0.25): Estimate | null {
  const offerRate = pick(answers, "offerRate");
  const coverage = pick(answers, "coverage");
  const filing = pick(answers, "filing");

  let scenario: EstimateScenario | null = null;
  if (
    ["partial", "policy", "unsure"].includes(offerRate) ||
    pick(answers, "measurement") === "unsure" ||
    coverage === "none"
  )
    scenario = "offer";
  else if (["mec_only", "mv_unsure", "unsure"].includes(coverage))
    scenario = "affordability";
  else if (filing === "onrequest") scenario = "furnishing";
  else if (["payroll", "internal", "unsure"].includes(filing))
    scenario = "reporting";
  if (!scenario) return null;

  const associates =
    ASSOCIATES_MIDPOINT[pick(answers, "associates")] ??
    ASSOCIATES_MIDPOINT["500_1999"];
  const fullTime = Math.max(0, Math.round(associates * fullTimeShare));
  const offerPenalty = 3340 * Math.max(0, fullTime - 30);

  const raw =
    scenario === "offer"
      ? offerPenalty
      : scenario === "affordability"
        ? Math.min(5010 * Math.round(0.1 * fullTime), offerPenalty)
        : scenario === "furnishing"
          ? 340 * fullTime
          : 680 * fullTime;
  const step = raw >= 100_000 ? 10_000 : 1_000;

  return {
    scenario,
    associates,
    fullTime,
    amount: Math.round(raw / step) * step,
  };
}
