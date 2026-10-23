import "server-only";

import { bandInfo, NEXT_STEP } from "./content";
import type { Answers, Assessment } from "./schemas";
import { MAX_POINTS, score } from "./scoring";

/** Finding copy shown on the result, keyed by `question:answer`. */
const FINDINGS: Record<string, { title: string; line: string }> = {
  "arrangement:moved2025": {
    title: "A program change in 2025",
    line: "When measurement history does not transfer cleanly between providers, months may go unreported or offers may appear late on the Form 1095-C.",
  },
  "arrangement:unsure": {
    title: "Program structure not confirmed",
    line: "The structure of the associate program determines which employer mandate penalty could apply.",
  },
  "measurement:lookback_internal": {
    title: "Look-back method maintained in-house",
    line: "The method is the right one. The risk is execution at volume: an initial measurement period for every new hire, overlapping stability periods, and every branch.",
  },
  "measurement:monthly": {
    title: "Monthly measurement in a variable-hour workforce",
    line: "Full-time status can change from month to month, which may leave associates without a timely offer. Each such month counts toward the 95% test.",
  },
  "measurement:offer_all": {
    title: "A waiting period without hours measurement",
    line: "Associates expected to work full-time at hire are treated differently from variable-hour associates, and the monthly record must still support each Form 1095-C.",
  },
  "measurement:manual": {
    title: "Full-time status tracked manually",
    line: "Weekly eligibility kept at branch level is where offers are most often missed and where reported codes diverge from payroll.",
  },
  "measurement:unsure": {
    title: "No single defined measurement method",
    line: "Without one, full-time status and every offer reported to the IRS may rest on reconstruction rather than on a record.",
  },
  "offerRate:nearly": {
    title: "A small number of offers may have been missed",
    line: "The margin is 5% of full-time employees, or five if greater. In any month it is exceeded, $278.33 (the 2026 rate of $3,340 a year) may apply to every full-time employee beyond the first 30, not only to those missed.",
  },
  "offerRate:policy": {
    title: "An offer policy, but no measured rate",
    line: "The IRS applies the 95% test to actual full-time employees, month by month. A policy does not establish the rate.",
  },
  "offerRate:partial": {
    title: "A meaningful share of full-time associates not offered",
    line: "This is the pattern that may fail the 95% test, the largest single source of employer mandate exposure.",
  },
  "offerRate:unsure": {
    title: "Offer rate not confirmed",
    line: "The share of full-time associates offered coverage is the figure on which the largest penalty depends.",
  },
  "coverage:mec_plus_mv": {
    title: "Affordability tested on the minimum value option",
    line: "With a preventive plan alongside a minimum value option, affordability is tested on the lowest-cost minimum value option, which should sit within an IRS safe harbor.",
  },
  "coverage:mv_unsure": {
    title: "Affordability not confirmed for 2026",
    line: "The 2026 threshold is 9.96%. An IRS safe harbor (W-2, rate of pay or federal poverty line) is the defensible way to establish it.",
  },
  "coverage:mec_only": {
    title: "A preventive care plan only",
    line: "It may address the 95% requirement, but it does not provide minimum value, so each full-time associate who obtains a premium tax credit may trigger a 2026 amount of $5,010 a year.",
  },
  "coverage:none": {
    title: "No associate coverage offered",
    line: "For an applicable large employer, a single full-time associate who obtains a premium tax credit may trigger a penalty calculated on all full-time employees beyond the first 30.",
  },
  "coverage:unsure": {
    title: "Coverage type not confirmed",
    line: "The type of coverage offered determines which employer mandate penalty could apply.",
  },
  "evidence:onboarding": {
    title: "Offer records held in onboarding files",
    line: "The evidence exists. Retrieving it across branches within the 90 days allowed to respond to an IRS letter is the risk.",
  },
  "evidence:systemflag": {
    title: "Availability recorded, not each decision",
    line: "In a response to the IRS, an individual record of the offer and the associate's election or waiver carries more weight than a system flag.",
  },
  "evidence:policy": {
    title: "Offers documented by policy, not by individual record",
    line: "Contesting a proposed payment generally requires showing the offer made to that associate in that month.",
  },
  "evidence:unsure": {
    title: "Offer evidence not confirmed",
    line: "It is not certain what could be produced for a specific associate and month, and a response to the IRS allows 90 days.",
  },
  "lifecycle:newhire": {
    title: "Returning associates restart the waiting period",
    line: "An associate who returns within 13 weeks is generally a continuing employee, and a new waiting period may leave months without an offer.",
  },
  "lifecycle:branch": {
    title: "Terminations and COBRA handled manually",
    line: "At weekly volume, this is where COBRA notice deadlines and rehire status are most often missed.",
  },
  "lifecycle:unsure": {
    title: "Terminations and returns not confirmed",
    line: "The 13-week rehire rule and COBRA notice deadlines both apply to every departing associate.",
  },
  "filing:payroll": {
    title: "Forms filed by payroll from supplied data",
    line: "The provider files what it receives. Offer codes come from eligibility data, and a mismatch there is what generates an IRS letter.",
  },
  "filing:internal": {
    title: "Forms prepared in-house",
    line: "Each incorrect return and each incorrect employee statement may carry a penalty of $340.",
  },
  "filing:onrequest": {
    title: "Forms 1095-C provided on request only",
    line: "The 2024 change permitting this does not extend to full-time employees, who must still be furnished a form. Each statement not furnished may carry a penalty of $340.",
  },
  "filing:unsure": {
    title: "Form preparation not confirmed",
    line: "The Forms 1094-C and 1095-C are the data the IRS uses to identify exposure.",
  },
  "irsLetters:resolved_nopay": {
    title: "A prior IRS letter, resolved",
    line: "The IRS has matched your firm's data once. The conditions that produced the letter may recur.",
  },
  "irsLetters:resolved_paid": {
    title: "A prior IRS letter, resolved with a payment",
    line: "If the underlying process is unchanged, later years remain open: for returns due after 2024, the IRS has six years to assess.",
  },
  "irsLetters:open": {
    title: "An IRS response in progress",
    line: "An independent review of the records behind it may be valuable before it is concluded.",
  },
  "irsLetters:unsure": {
    title: "IRS correspondence not confirmed",
    line: "These letters are often addressed to a registered address rather than to the executive team.",
  },
};

/** "Already in order" copy for zero-point answers. */
const STRENGTHS: Record<string, string> = {
  "arrangement:established":
    "An established program, reviewed within the past year",
  "arrangement:renewing": "A program review already on the calendar",
  "measurement:lookback_admin": "A look-back method run weekly from payroll",
  "offerRate:all": "Every full-time associate offered, with evidence",
  "coverage:mv_safeharbor": "Minimum value coverage priced under a safe harbor",
  "evidence:recorded": "Individual offer records, retrievable the same day",
  "lifecycle:automated":
    "Coverage, COBRA and the 13-week rule applied consistently",
  "filing:specialist": "Forms reconciled to weekly payroll",
  "irsLetters:none": "No IRS correspondence on record",
};

export function assess(answers: Answers): Assessment {
  const result = score(answers);
  const band = bandInfo(result.band);
  return {
    band: result.band,
    points: result.points,
    maxPoints: MAX_POINTS,
    headline: band.headline,
    explanation: band.explanation,
    settledBy: result.settledBy,
    drivers: result.drivers.flatMap((key) =>
      FINDINGS[key] ? [{ key, ...FINDINGS[key] }] : [],
    ),
    strengths: result.strengths.flatMap((key) =>
      STRENGTHS[key] ? [STRENGTHS[key]] : [],
    ),
    nextStep: NEXT_STEP[result.band],
  };
}
