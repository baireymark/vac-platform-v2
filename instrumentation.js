// Runs once when the Next.js server starts. Logs whether SMTP is reachable, as serve.mjs did.
// Skipped on Vercel so serverless cold starts don't open an SMTP connection.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.VERCEL) return;
  const { getTransport } = await import("./lib/mail.js");
  const transport = getTransport();
  if (transport) transport.verify().then(() => console.log(`SMTP ready (${process.env.SMTP_HOST})`), e => console.error(`SMTP check failed: ${e.message}`));
  else console.warn("SMTP not configured (set SMTP_HOST and MAIL_TO in .env); form posts will return 503.");
}
