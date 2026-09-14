import { NextResponse } from "next/server";
import { z } from "zod";

const pageviewInput = z.object({
  path: z.string().max(300).startsWith("/"),
});

export async function POST(request: Request) {
  try {
    const pageview = pageviewInput.parse(await request.json());
    console.info(JSON.stringify({ type: "pageview", ...pageview, recordedAt: new Date().toISOString() }));
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Invalid pageview." }, { status: 400 });
  }
}
