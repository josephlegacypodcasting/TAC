import { forwardLead } from "@/lib/leads";
import { leadRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = leadRequestSchema.safeParse(json);
  if (!parsed.success)
    return Response.json({ error: "Please check your details." }, { status: 400 });

  try {
    await forwardLead({ event: "lead", ...parsed.data });
  } catch (err) {
    console.error("[exposure-check] lead forward failed", err);
    return Response.json({ error: "We could not save your details." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
