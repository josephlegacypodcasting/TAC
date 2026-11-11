import "server-only";

import { bandInfo, ESTIMATE_COPY, QUESTIONS } from "./content";
import { ROLES, type Answers, type Assessment, type Lead } from "./schemas";
import { estimate } from "./scoring";

type LeadEvent = {
  event: "lead" | "assessment";
  lead?: Lead;
  answers?: Answers;
  assessment?: Assessment;
  gateMode?: string;
  utm?: Record<string, string>;
};

function answerText(questionId: string, value: Answers[string] | undefined) {
  if (value === undefined) return "";
  const options = QUESTIONS.find((q) => q.id === questionId)?.options ?? [];
  const values = Array.isArray(value) ? value : [value];
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v).join("; ");
}

/**
 * Flattens an event into top-level fields so each one can be mapped
 * directly in a GoHighLevel inbound webhook trigger.
 */
function buildPayload({ event, lead, answers = {}, assessment, gateMode, utm = {} }: LeadEvent) {
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined);

  const body: Record<string, unknown> = {
    // Tracking params first, so they can never overwrite the fields below.
    ...utm,
    event: event === "lead" ? "lead_captured" : "assessment_completed",
    source: "aca-exposure-check",
    submitted_at: new Date().toISOString(),
    gate_mode: gateMode ?? "",

    first_name: lead?.firstName ?? "",
    last_name: lead?.lastName ?? "",
    full_name: [lead?.firstName, lead?.lastName].filter(Boolean).join(" "),
    email: lead?.email ?? "",
    company_name: lead?.company ?? "",
    role: lead?.role ?? "",
    role_label: ROLES.find((r) => r.value === lead?.role)?.label ?? "",

    questions_answered: answered.length,
    questions_total: QUESTIONS.length,
    answers_summary: answered
      .map((q) => `${q.prompt}\n→ ${answerText(q.id, answers[q.id])}`)
      .join("\n\n"),
    answers,
  };

  // One field per question, e.g. answer_coverage: "A preventive care plan ... only".
  for (const q of QUESTIONS) body[`answer_${q.id}`] = answerText(q.id, answers[q.id]);

  if (assessment) {
    const est = assessment.band === "low" ? null : estimate(answers);
    Object.assign(body, {
      exposure_band: assessment.band,
      exposure_level: bandInfo(assessment.band).name,
      exposure_points: assessment.points,
      exposure_max_points: assessment.maxPoints,
      exposure_headline: assessment.headline,
      exposure_settled_by: assessment.settledBy,
      findings_count: assessment.drivers.length,
      findings_summary: assessment.drivers
        .map((d, i) => `${i + 1}. ${d.title}: ${d.line}`)
        .join("\n"),
      strengths_summary: assessment.strengths.join("\n"),
      findings: assessment.drivers,
      strengths: assessment.strengths,
      estimate_scenario: est ? ESTIMATE_COPY.scenarios[est.scenario].label : "",
      estimate_amount: est?.amount ?? 0,
      estimate_full_time_associates: est?.fullTime ?? 0,
    });
  }

  return body;
}

/**
 * Forwards a lead or completed assessment to the CRM webhook
 * (a GoHighLevel inbound webhook trigger). Without LEAD_WEBHOOK_URL
 * set, the payload is only logged.
 */
export async function forwardLead(payload: LeadEvent) {
  const body = buildPayload(payload);
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    console.info("[exposure-check] LEAD_WEBHOOK_URL not set; payload:", JSON.stringify(body));
    return;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Lead webhook responded ${res.status}`);
}
