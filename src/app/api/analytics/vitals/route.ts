import { NextResponse } from "next/server";
import { z } from "zod";

const metricInput = z.object({
  id: z.string().max(120),
  name: z.enum(["CLS", "FCP", "FID", "INP", "LCP", "TTFB"]),
  value: z.number().finite().min(0),
  rating: z.string().max(32).optional(),
  navigationType: z.string().max(48).optional(),
  path: z.string().max(300).startsWith("/"),
});

export async function POST(request: Request) {
  try {
    const metric = metricInput.parse(await request.json());
    console.info(JSON.stringify({ type: "web-vital", ...metric, recordedAt: new Date().toISOString() }));
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Invalid performance metric." }, { status: 400 });
  }
}
