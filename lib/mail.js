// Shared form-to-email logic, used by the route handler (app/api/[form]/route.js).
import nodemailer from "nodemailer";

const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const phoneOK = v => v.replace(/\D/g, "").length >= 10;
const clean = (v, max = 200) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
const yes = v => v === true || v === "on" || v === "yes" || v === "true";

// Each form: turn the posted JSON into { name, email, subject, rows } or an error string.
const forms = {
  contact(b) {
    const name = clean(b.name), email = clean(b.email), phone = clean(b.phone, 40);
    if (name.length < 2 || !emailOK(email) || (phone && !phoneOK(phone))) return "Please add your name and a valid email.";
    return { name, email, subject: `Website contact — ${name}`, rows: [
      ["Name", name], ["Email", email], ["Phone", phone || "—"], ["SMS consent", yes(b.sms) ? "Yes" : "No"],
      ["Message", String(b.message ?? "").trim().slice(0, 5000) || "—"],
    ] };
  },
  intake(b) {
    const name = clean(b.name), email = clean(b.email), phone = clean(b.phone, 40);
    if (name.length < 2 || !emailOK(email) || !phoneOK(phone)) return "Please add your name, a valid email and a 10-digit phone number.";
    return { name, email, subject: `Free evaluation request — ${name}`, rows: [
      ["Name", name], ["Email", email], ["Phone", phone],
      ["Applied before", clean(b.applied)], ["Denied before", clean(b.denied)],
      ["Branch", clean(b.branch)], ["Service period", clean(b.period)], ["Disability status", clean(b.status)],
      ["Agreed to terms", yes(b.terms) ? "Yes" : "No"], ["SMS consent", yes(b.sms) ? "Yes" : "No"],
    ] };
  },
  lead(b) { // from vac-chatbot.js (leadWebhook)
    const name = clean(b.name), email = clean(b.email), phone = clean(b.phone, 40), a = b.answers || {};
    if (name.length < 2 || !emailOK(email)) return "Please add your name and a valid email.";
    return { name, email, subject: `Chatbot ${clean(b.flow, 40) || "lead"} — ${name}`, rows: [
      ["Name", name], ["Email", email], ["Phone", phone || "—"], ["SMS consent", yes(b.smsConsent) ? "Yes" : "No"],
      ["Flow", clean(b.flow, 40)], ["Help needed", clean(a.topic)], ["Applied before", clean(a.appliedBefore)],
      ["Denied before", clean(a.deniedBefore)], ["Branch", clean(a.branch)], ["Served", clean(a.serviceEra)],
      ["Current rating", clean(a.disabilityRating)], ["Page", clean(b.page, 500)],
    ].filter(([, v]) => v) };
  },
};

// Created on first use so environment variables are read after .env (local) or Vercel has set them.
let transport;
export function getTransport() {
  const env = process.env;
  if (!env.SMTP_HOST || !env.MAIL_TO) return null;
  return transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : Number(env.SMTP_PORT) === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

const escHtml = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sendForm = ({ name, email, subject, rows }) => getTransport().sendMail({
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
  to: process.env.MAIL_TO,
  replyTo: { name, address: email },
  subject,
  text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
  html: `<table cellpadding="6" style="border-collapse:collapse;font:14px sans-serif">${rows.map(([k, v]) =>
    `<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd">${escHtml(k)}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escHtml(v)}</td></tr>`).join("")}</table>`,
});

// Simple per-IP limit: 10 submissions per 10 minutes (per server instance).
const hits = new Map();
const limited = ip => {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 600_000);
  list.push(now); hits.set(ip, list);
  return list.length > 10;
};

// Validate and email one submission. Returns [httpStatus, jsonBody].
export async function submit(formName, body, ip) {
  const form = Object.hasOwn(forms, formName) ? forms[formName] : null;
  if (!form) return [404, { ok: false, error: "Not found." }];
  if (!getTransport()) return [503, { ok: false, error: "Email isn't set up on this server." }];
  if (limited(ip || "?")) return [429, { ok: false, error: "Too many submissions. Please try again later." }];
  if (!body || typeof body !== "object") return [400, { ok: false, error: "Bad request." }];
  if (body.website) return [200, { ok: true }]; // honeypot: pretend success
  const msg = form(body);
  if (typeof msg === "string") return [400, { ok: false, error: msg }];
  try {
    await sendForm(msg);
    return [200, { ok: true }];
  } catch (e) {
    console.error(`SMTP send failed: ${e.message}`);
    return [502, { ok: false, error: "We couldn't send that right now." }];
  }
}
