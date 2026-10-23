import { assess } from "@/lib/assess";
import { forwardLead } from "@/lib/leads";
import { assessRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = assessRequestSchema.safeParse(json);
  if (!parsed.success)
    return Response.json({ error: "Invalid request." }, { status: 400 });

  const { answers, lead, gateMode, utm } = parsed.data;
  const assessment = assess(answers);

  if (lead) {
    await forwardLead({ event: "assessment", lead, answers, assessment, gateMode, utm }).catch(
      (err) => console.error("[exposure-check] assessment forward failed", err),
    );
  }

  return Response.json({ assessment });
}
