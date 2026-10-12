// Server for the V4 page: `npm install`, then `npm start` (or `node serve.mjs`), then open http://localhost:4174
// Serves the static site and emails form submissions over SMTP (settings in .env, see .env.example).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
try { process.loadEnvFile(join(root, ".env")); } catch { /* no .env: use the real environment */ }
const { getTransport, submit } = await import("./lib/mail.js");

const port = Number(process.env.PORT) || 4174;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

// ---------- SMTP (shared with the Vercel function in api/) ----------
const transport = getTransport();
if (transport) transport.verify().then(() => console.log(`SMTP ready (${process.env.SMTP_HOST})`), e => console.error(`SMTP check failed: ${e.message}`));
else console.warn("SMTP not configured (set SMTP_HOST and MAIL_TO in .env); form posts will return 503.");

const readJson = req => new Promise((resolve, reject) => {
  let size = 0, chunks = [];
  req.on("data", c => { size += c.length; if (size > 32_768) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
  req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch (e) { reject(e); } });
  req.on("error", reject);
});

const json = (res, code, body) => res.writeHead(code, { "Content-Type": "application/json" }).end(JSON.stringify(body));

async function handlePost(req, res, path) {
  if (!path.startsWith("/api/")) { req.resume(); res.writeHead(404).end(); return; }
  let body;
  try { body = await readJson(req); } catch { json(res, 400, { ok: false, error: "Bad request." }); return; }
  const [status, out] = await submit(path.slice(5), body, req.socket.remoteAddress);
  json(res, status, out);
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (req.method === "POST") { await handlePost(req, res, path); return; }
  if (req.method !== "GET" && req.method !== "HEAD") { req.resume(); res.writeHead(405).end(); return; }
  let file = normalize(join(root, /^(\/assets\/|\/js\/|\/vac-chatbot\.js$)/.test(path) ? "public" : "", path));
  const rel = file.slice(normalize(root).length);
  // Keep server files, secrets (.env, .git) and dependencies private.
  if (!file.startsWith(normalize(root)) || /(^|[\\/])\./.test(rel) || /(^|[\\/])node_modules([\\/]|$)/.test(rel) ||
      /^[\\/]?(serve\.mjs|package(-lock)?\.json)$/.test(rel)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404, { "Content-Type": types[".html"] }).end("<!doctype html><title>Not found</title><p>Not found. <a href=\"/\">Home</a></p>");
  }
}).listen(port, () => console.log(`VAC V4 on http://localhost:${port}`));
