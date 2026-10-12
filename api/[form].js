// Vercel function: POST /api/contact, /api/intake, /api/lead → email over SMTP (see api/_mail.js).
// Set SMTP_* and MAIL_* in Vercel → Project → Settings → Environment Variables.
import { submit } from "../lib/mail.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); res.status(405).json({ ok: false, error: "Method not allowed." }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress;
  const [status, json] = await submit(String(req.query.form || ""), body, ip);
  res.status(status).json(json);
}
