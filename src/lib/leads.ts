import "server-only";

import type { Answers, Assessment, Lead } from "./schemas";

type LeadEvent = {
  event: "lead" | "assessment";
  lead?: Lead;
  answers?: Answers;
  assessment?: Assessment;
  gateMode?: string;
  utm?: Record<string, string>;
};

/**
 * Forwards a lead or completed assessment to the CRM webhook
 * (for example a GoHighLevel inbound webhook trigger). Without
 * LEAD_WEBHOOK_URL set, the payload is only logged, which is the
 * expected behaviour in local development.
 */
export async function forwardLead(payload: LeadEvent) {
  const body = {
    ...payload,
    source: "aca-exposure-check",
    submittedAt: new Date().toISOString(),
  };
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
