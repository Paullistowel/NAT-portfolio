import { contactConfigured } from "@/lib/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best-effort per-instance rate limit. For stricter limits use a shared store (e.g. Upstash).
const hits = new Map<string, number[]>();

const json = (body: object, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  if (!contactConfigured()) {
    return json({ error: "The contact form isn’t configured yet. Please email directly." }, 503);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return json({ error: "Too many messages — please try again later." }, 429);
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const str = (k: string, max: number) => (typeof data[k] === "string" ? (data[k] as string).trim().slice(0, max) : "");
  const name = str("name", 200);
  const email = str("email", 200);
  const subject = str("subject", 200);
  const message = str("message", 5000);

  // Spam checks: honeypot filled, or submitted implausibly fast. Respond as success so bots learn nothing.
  if (str("company", 200) || (typeof data.elapsed === "number" && data.elapsed < 2500)) {
    return json({ ok: true });
  }

  if (!name || !EMAIL_RE.test(email) || !subject || message.length < 10) {
    return json({ error: "Please complete all fields with a valid email address." }, 422);
  }

  recent.push(now);
  hits.set(ip, recent);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `[Portfolio] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    console.error("Contact form delivery failed", res.status, await res.text().catch(() => ""));
    return json({ error: "Your message couldn’t be delivered. Please try again or email directly." }, 502);
  }
  return json({ ok: true });
}
