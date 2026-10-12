// Smoke test for a running server: `npm run build && npm start`, then `npm run smoke` (or `node scripts/smoke.mjs <url>`).
// Checks the page, every file it and its scripts reference, the form API's error paths and that private files stay private.
// It never posts a valid form, so no email is sent.
import { readdir } from "node:fs/promises";

const base = (process.argv[2] || "http://localhost:4174").replace(/\/$/, "");
let failed = 0;
const check = (ok, label, detail = "") => { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? ` (${detail})` : ""}`); };

// The page
const res = await fetch(`${base}/`);
const html = await res.text();
check(res.status === 200, "GET /", res.status);
check(html.includes("<title>Veterans Advocate Center | You stood for us. Now we stand with you.</title>"), "title");
check(html.includes('name="description"'), "meta description");
check(html.includes('<html lang="en"'), "html lang");
for (const id of ["top", "main", "calculator", "evaluation", "services", "stories", "about", "process", "resources", "faq", "call", "contact", "menu", "intakeForm", "contactForm", "tt"]) {
  check(html.includes(`id="${id}"`), `#${id} rendered`);
}

// Everything the page references locally, plus what the scripts load at runtime
const refs = new Set([...html.matchAll(/(?:src|href|data-still)="(\/(?!\/|_next)[^"#]*)"/g)].map(m => m[1]).filter(p => p !== "/"));
for (const s of ["/js/va-math.js", "/assets/calculator/vac-body-map.js", "/js/calculator-3d.js", "/assets/calculator/model-male.js", "/assets/calculator/model-female.js", "/js/app.js", "/vac-chatbot.js"]) refs.add(s);
for (const path of [...refs].sort()) {
  const r = await fetch(base + path);
  check(r.status === 200 && Number(r.headers.get("content-length") ?? 1) > 0, path, `${r.status} ${r.headers.get("content-type")}`);
}

// Form API: error paths only
// A fresh client address per run, so repeated runs stay under the per-IP rate limit.
const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`;
const post = (form, body, raw) => fetch(`${base}/api/${form}`, { method: "POST", headers: { "Content-Type": "application/json", "X-Forwarded-For": ip }, body: raw ?? JSON.stringify(body) });
const expect = async (label, p, status, error) => {
  const r = await p; const j = await r.json().catch(() => ({}));
  check(r.status === status && (error === undefined || j.error === error), label, `${r.status} ${JSON.stringify(j)}`);
};
const smtp = (await (await post("contact", { name: "A" })).json()).error !== "Email isn't set up on this server.";
if (!smtp) console.log("note: SMTP isn't configured on this server; validation checks expect 503");
await expect("POST /api/unknown → 404", post("unknown", {}), 404, "Not found.");
await expect("POST /api/contact invalid → 400", post("contact", { name: "A", email: "bad" }), smtp ? 400 : 503);
await expect("POST /api/intake missing phone → 400", post("intake", { name: "Al", email: "a@b.co" }), smtp ? 400 : 503);
await expect("POST /api/lead invalid → 400", post("lead", { name: "x" }), smtp ? 400 : 503);
await expect("POST /api/contact bad JSON → 400", post("contact", null, "not json"), smtp ? 400 : 503);
await expect("POST /api/contact > 32 KB → 400", post("contact", { m: "a".repeat(40_000) }), 400, "Bad request.");
if (smtp) await expect("POST /api/contact honeypot → 200, not sent", post("contact", { website: "x", name: "Al", email: "a@b.co" }), 200);
const g = await fetch(`${base}/api/contact`);
check(g.status === 405 && g.headers.get("allow") === "POST", "GET /api/contact → 405 Allow: POST", g.status);

// Private files must not be served
for (const path of ["/.env", "/.env.example", "/package.json", "/lib/mail.js", "/app/api/%5Bform%5D/route.js", "/next.config.js", "/node_modules/nodemailer/package.json"]) {
  const r = await fetch(base + path);
  check(r.status === 404, `${path} not served`, r.status);
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
