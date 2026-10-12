import localFont from "next/font/local";
import "./globals.css";

// Self-hosted fonts, so first paint doesn't wait on Google's servers. The files in ./fonts are the latin files Google
// Fonts served this site (see ./fonts/README.md). globals.css uses it through --sans, for headings and labels too.
// adjustFontFallback is off so characters the fonts lack (such as →) fall back to the stack in globals.css, as before,
// instead of to a size-adjusted Arial. (next/font/google ignores that option under Turbopack, hence next/font/local.)
// Font loader options must be literals.
// One variable file, declared at the five weights the CSS uses, like Google's stylesheet did.
const sans = localFont({
  src: [
    { path: "./fonts/Montserrat-latin.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Montserrat-latin.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Montserrat-latin.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Montserrat-latin.woff2", weight: "800", style: "normal" },
    { path: "./fonts/Montserrat-latin.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata = {
  title: "Veterans Advocate Center | You stood for us. Now we stand with you.",
  description: "Veteran-owned guidance for VA disability benefits. Mark where it hurts, see an example estimate, and start a free evaluation.",
};

export default function RootLayout({ children }) {
  // suppressHydrationWarning: browser extensions (Grammarly, translators, dark-mode tools) add attributes to
  // <html> and <body> before React hydrates. It only covers these two elements' own attributes, not the page.
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/assets/img/hero-bg.avif" type="image/avif" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
