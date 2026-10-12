// POST /api/contact, /api/intake, /api/lead → email over SMTP (see lib/mail.js).
// Set SMTP_* and MAIL_* in .env locally, or in Vercel → Project → Settings → Environment Variables.
import { submit } from "@/lib/mail.js"; // Node.js runtime (the default), which nodemailer needs

const MAX_BODY = 32_768; // same limit serve.mjs used

export async function POST(req, { params }) {
  const { form } = await params;
  const text = await req.text();
  if (Buffer.byteLength(text) > MAX_BODY) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
  let body;
  try { body = JSON.parse(text); } catch { body = null; }
  const ip = String(req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;
  const [status, json] = await submit(String(form || ""), body, ip);
  return Response.json(json, { status });
}

// Any other method gets the same 405 the Vercel function returned.
const notAllowed = () => Response.json({ ok: false, error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
export { notAllowed as GET, notAllowed as PUT, notAllowed as PATCH, notAllowed as DELETE, notAllowed as OPTIONS };
