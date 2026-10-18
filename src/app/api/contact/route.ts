import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { MemoryRateLimiter, clientKey } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/errors";

const limiter = new MemoryRateLimiter(Number(process.env.CONTACT_RATE_LIMIT_PER_HOUR ?? 5), 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const rate = await limiter.consume(clientKey(request.headers));
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    const parsed = contactSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the form fields." }, { status: 400 });
    }
    // Send or store parsed.data here. Never log the message body or the email address.
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
