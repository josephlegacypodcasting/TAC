import type { Band } from "./schemas";

export type GateMode = "first" | "last" | "off";

const envGate = process.env.NEXT_PUBLIC_GATE_MODE;
export const GATE_MODE: GateMode =
  envGate === "last" || envGate === "off" ? envGate : "first";

export const CONTACT_EMAIL = "kcleary@tacbenefitsgroup.com";
export const CTA_URL =
  process.env.NEXT_PUBLIC_TAC_CTA_URL ||
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("ACA Compliance Exposure Check: compliance review")}`;
/** Calendly scheduling page embedded on the result page. Set to "off" to hide it. */
const envCalendar = process.env.NEXT_PUBLIC_TAC_CALENDAR_URL;
export const CALENDAR_URL =
  envCalendar === "off" ? "" : envCalendar || "https://calendly.com/kcleary-tac540/30min";
export const SITE_URL ="https://tacbenefitsgroup.com";
export const BRAND = "TAC Benefits Group";
export const PRODUCT = "ACA Compliance Exposure Check";
export const PHONE = "215-663-8000";
export const ADDRESS = "540 Pennsylvania Ave, Fort Washington, PA 19034";

export const STAFFING_EDGE_STATS = [
  { value: "100%", label: "ACA compliance, guaranteed" },
  { value: "$0", label: "Net cost to your firm" },
  { value: "3", label: "Payroll files a week from your team" },
];

export const PROOF_STATS = [
  { value: "98%", label: "Client retention" },
  { value: "20,000+", label: "Subscribers" },
  { value: "50+", label: "Years in staffing" },
];

export const TESTIMONIAL = {
  quote:
    "What we value the most is that our need to get involved is so limited. They do a great job of responding quickly and making everything simple for our team, and for that, we're very grateful.",
  name: "Adam Adler",
  title: "HR/Safety/Risk Director, UCP Staffing",
};

export const GATE_COPY = {
  unlock: {
    eyebrow: "Complimentary · Under 3 minutes · 10 questions",
    heading: "Is your staffing firm as ACA compliant as you believe?",
    body: "Ten questions on how your associates are measured, offered coverage and reported. Your result shows your exposure level, the findings behind it, and an illustrative estimate at 2026 IRS amounts. Nothing to download.",
    action: "Begin the exposure check",
    reassurance:
      "Your details are used to send your result and occasional correspondence from TAC Benefits Group. You may unsubscribe at any time.",
  },
  verify: {
    eyebrow: "Your result is ready",
    heading: "Where should we send it?",
    body: "One final step before your result is displayed. It appears on this page immediately, and a copy is sent to you.",
    action: "Show my result",
    reassurance:
      "Your details are used to send your result and occasional correspondence from TAC Benefits Group. You may unsubscribe at any time.",
  },
} as const;
export type GateFraming = keyof typeof GATE_COPY;

export type QuestionOption = { value: string; label: string; hint?: string };
export type Question = {
  id: string;
  type: "single" | "multi" | "text";
  prompt: string;
  help?: string;
  placeholder?: string;
  optional?: boolean;
  options?: QuestionOption[];
};

export const QUESTIONS: Question[] = [
  {
    id: "associates",
    type: "single",
    prompt:
      "How many temporary associates are on your payroll in a typical week?",
    help: "Associates on assignment, not internal staff.",
    options: [
      { value: "lt200", label: "Fewer than 200" },
      { value: "200_499", label: "200 to 499" },
      { value: "500_1999", label: "500 to 1,999" },
      { value: "2000_4999", label: "2,000 to 4,999" },
      { value: "gte5000", label: "5,000 or more" },
    ],
  },
  {
    id: "specialty",
    type: "single",
    prompt: "Where does your firm place most of its associates?",
    options: [
      { value: "light_industrial", label: "Light industrial" },
      { value: "clerical", label: "Clerical and administrative" },
      { value: "healthcare", label: "Healthcare" },
      { value: "hospitality", label: "Hospitality" },
      { value: "professional", label: "IT or professional" },
      { value: "other", label: "A mix, or another specialty" },
    ],
  },
  {
    id: "arrangement",
    type: "single",
    prompt: "Which best describes your associate benefits program today?",
    options: [
      {
        value: "established",
        label: "An established program, reviewed within the past year",
      },
      {
        value: "moved2025",
        label: "We changed programs after a provider left the market in 2025",
      },
      {
        value: "renewing",
        label:
          "Our program renews or is under review within the next six months",
      },
      {
        value: "unsure",
        label: "I am not certain how the program is structured",
      },
    ],
  },
  {
    id: "measurement",
    type: "single",
    prompt:
      "How does your firm determine which associates are full-time for ACA purposes?",
    help: "Full-time means an average of 30 hours of service a week, or 130 hours in a month.",
    options: [
      {
        value: "lookback_admin",
        label:
          "A look-back measurement method, run weekly from payroll by a dedicated administrator",
      },
      {
        value: "lookback_internal",
        label: "A look-back measurement method, maintained by our own team",
      },
      { value: "monthly", label: "The monthly measurement method" },
      {
        value: "offer_all",
        label:
          "We offer coverage to every associate after a set waiting period, without measuring hours",
      },
      {
        value: "manual",
        label:
          "Tracked manually, for example in spreadsheets kept by branches or HR",
      },
      {
        value: "unsure",
        label: "No single defined method, or I am not certain",
      },
    ],
  },
  {
    id: "offerRate",
    type: "single",
    prompt:
      "Over the past year, what share of associates who worked full-time hours received a documented offer of coverage?",
    help: "Include associates on short assignments and at every branch.",
    options: [
      { value: "all", label: "All of them, and we could evidence each offer" },
      {
        value: "nearly",
        label: "Nearly all. A small number may have been missed",
      },
      {
        value: "policy",
        label:
          "Our policy is to offer everyone, but we have not measured the actual rate",
      },
      {
        value: "partial",
        label:
          "A meaningful share were not offered, for example on short assignments or at certain branches",
      },
      { value: "unsure", label: "I am not certain" },
    ],
  },
  {
    id: "coverage",
    type: "single",
    prompt:
      "Which best describes the lowest-cost coverage offered to full-time associates?",
    options: [
      {
        value: "mv_safeharbor",
        label:
          "A plan that provides minimum value, priced under an IRS affordability safe harbor",
      },
      {
        value: "mec_plus_mv",
        label:
          "A preventive care plan, with a minimum value option also offered",
      },
      {
        value: "mv_unsure",
        label:
          "A plan that provides minimum value, but I am not certain it meets the 2026 affordability threshold",
      },
      {
        value: "mec_only",
        label: "A preventive care plan (minimum essential coverage) only",
      },
      {
        value: "none",
        label: "We do not currently offer associates health coverage",
      },
      { value: "unsure", label: "I am not certain" },
    ],
  },
  {
    id: "evidence",
    type: "single",
    prompt:
      "If the IRS asked you to show that a specific associate was offered coverage in a specific month, what could you produce?",
    options: [
      {
        value: "recorded",
        label:
          "A recorded call or a signed election or waiver, retrievable the same day",
      },
      {
        value: "onboarding",
        label:
          "A signed acknowledgment in an onboarding file, retrievable with some effort",
      },
      {
        value: "systemflag",
        label:
          "A system record that coverage was made available, without the associate's response",
      },
      {
        value: "policy",
        label: "A policy or handbook statement, not an individual record",
      },
      { value: "unsure", label: "I am not certain" },
    ],
  },
  {
    id: "lifecycle",
    type: "single",
    prompt:
      "When an enrolled associate's assignment ends and the associate later returns, what happens?",
    help: "For example, an associate who returns after eight weeks without hours.",
    options: [
      {
        value: "automated",
        label:
          "Coverage ends only when employment ends under a defined policy, the COBRA notice goes out on time, and a return within 13 weeks restores prior status",
      },
      {
        value: "newhire",
        label:
          "COBRA notices go out reliably, but a returning associate starts a new waiting period",
      },
      {
        value: "branch",
        label:
          "Terminations, COBRA notices and returns are handled by each branch or by HR manually",
      },
      { value: "unsure", label: "I am not certain" },
    ],
  },
  {
    id: "filing",
    type: "single",
    prompt:
      "Who prepares your Forms 1094-C and 1095-C, and how are they checked against payroll?",
    options: [
      {
        value: "specialist",
        label:
          "A specialist administrator that also tracks eligibility, reconciled to weekly payroll",
      },
      {
        value: "payroll",
        label: "Our payroll provider files them from the data we supply",
      },
      { value: "internal", label: "Our own team prepares and files them" },
      {
        value: "onrequest",
        label: "We file them, and provide employee copies only on request",
      },
      { value: "unsure", label: "I am not certain" },
    ],
  },
  {
    id: "irsLetters",
    type: "single",
    prompt:
      "Has your firm received IRS correspondence about ACA reporting or employer mandate payments?",
    help: "For example, a Letter 226-J, the notice the IRS sends to propose an employer mandate payment.",
    options: [
      { value: "none", label: "No, not to my knowledge" },
      { value: "resolved_nopay", label: "Yes, resolved without a payment" },
      { value: "resolved_paid", label: "Yes, resolved with a payment" },
      { value: "open", label: "Yes, and a response or appeal is in progress" },
      {
        value: "unsure",
        label: "I am not certain whether one has been received",
      },
    ],
  },
];

export const BANDS: {
  id: Band;
  name: string;
  headline: string;
  explanation: string;
  summary: string;
}[] = [
  {
    id: "low",
    name: "Low exposure",
    headline: "Your responses indicate a low level of ACA exposure.",
    explanation:
      "Your responses indicate that most of the controls the IRS tests first are in place. Exposure in staffing is rarely static, however: branch growth, new client assignments and a change of provider can each reopen a gap.",
    summary: "The controls the IRS tests first appear to be in place.",
  },
  {
    id: "medium",
    name: "Medium exposure",
    headline: "Your responses indicate a moderate level of ACA exposure.",
    explanation:
      "One or more of your answers describe practices that many staffing firms regard as compliant, but that may not hold up under IRS review. Each is common and can be resolved, but your firm may carry exposure it has not yet measured.",
    summary:
      "Practices many firms regard as compliant, which may not hold up under review.",
  },
  {
    id: "high",
    name: "High exposure",
    headline: "Your responses indicate a high level of ACA exposure.",
    explanation:
      "One or more of your answers points to a gap that may give rise to an employer mandate payment. These payments are calculated per full-time employee and per month, and for returns due after 2024 the IRS has six years to assess them.",
    summary: "A gap that may give rise to an employer mandate payment.",
  },
];

export function bandInfo(id: Band) {
  const band = BANDS.find((b) => b.id === id);
  if (!band) throw new Error(`Unknown band: ${id}`);
  return band;
}

export const NEXT_STEP: Record<Band, string> = {
  low: "A complimentary compliance review with Kieran Cleary confirms what your answers suggest and identifies anything that changes as your firm grows.",
  medium:
    "Kieran Cleary, Vice President at TAC Benefits Group, will review your answers with you: where your firm stands, what each finding means in practice, and how to close the gaps.",
  high: "Kieran Cleary, Vice President at TAC Benefits Group, will review your answers with you promptly: where your firm stands, what each finding means in practice, and how to close the gaps.",
};

export type EstimateScenario =
  | "offer"
  | "affordability"
  | "furnishing"
  | "reporting";

export const ESTIMATE_COPY = {
  framing:
    "Illustrative estimate, not a legal determination. Based on your answers, the 2026 IRS penalty amounts and the assumption shown.",
  scenarios: {
    offer: {
      label: "If the 95% offer test were failed for a full year",
      detail: (n: number) =>
        `$3,340 for each full-time employee beyond the first 30. At an estimated ${n.toLocaleString("en-US")} full-time associates, the annual amount could approach this figure.`,
    },
    affordability: {
      label: "If one in ten full-time associates obtained a premium tax credit",
      detail: (n: number) =>
        `$5,010 for each full-time associate who obtains a credit for the year. Shown for one in ten of an estimated ${n.toLocaleString("en-US")} full-time associates.`,
    },
    furnishing: {
      label: "If no full-time associate were furnished a Form 1095-C",
      detail: (n: number) =>
        `$340 for each statement not furnished, across an estimated ${n.toLocaleString("en-US")} full-time associates.`,
    },
    reporting: {
      label: "If every full-time associate's Form 1095-C were incorrect",
      detail: (n: number) =>
        `Up to $680 for each form: $340 for the return and $340 for the employee statement, across an estimated ${n.toLocaleString("en-US")} full-time associates.`,
    },
  } satisfies Record<
    EstimateScenario,
    { label: string; detail: (n: number) => string }
  >,
  footnote:
    "Employer mandate payments are calculated monthly and stated here as an annual amount. For returns due after 2024, the IRS may assess up to six years after the filing due date.",
  footnoteForms:
    "Information return penalties apply per form, for each year's filing.",
  belowThreshold:
    "At this share, the estimated full-time count is within the 30 employees excluded from the calculation. Whether your firm is an applicable large employer depends on all employees, including internal staff.",
};

export function answerLabel(key: string) {
  const [questionId, value] = key.split(":");
  const question = QUESTIONS.find((q) => q.id === questionId);
  return question?.options?.find((o) => o.value === value)?.label ?? value;
}
