import { NextResponse } from "next/server";
import { canOperate, createIncident, incidentInput, serializeServiceError } from "@/lib/server/event-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canOperate(user.role)) return NextResponse.json({ error: "You cannot record incidents." }, { status: 403 });
  try {
    const input = incidentInput.parse(await request.json());
    const { eventId } = await params;
    const incident = await createIncident(eventId, user.id, input);
    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    const result = serializeServiceError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
