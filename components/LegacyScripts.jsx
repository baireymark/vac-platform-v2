"use client";
// Loads the page's original browser scripts after React has hydrated the markup, in the same order
// as their old `defer` tags. They look up elements by id and change the DOM directly, so running
// them before hydration would cause mismatches. Dynamically added scripts keep their order only
// with async = false.
import { useEffect } from "react";

const SCRIPTS = ["/js/va-math.js", "/assets/calculator/vac-body-map.js", "/js/calculator-3d.js", "/js/app.js", "/vac-chatbot.js"];

let loaded = false; // Strict Mode runs effects twice in development

export default function LegacyScripts() {
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    // Optional settings — remove or edit as needed
    window.VACChatConfig = {
      leadWebhook: "/api/lead", // emailed over SMTP (app/api/[form]/route.js)
      aiEndpoint: "", // e.g. "/wp-json/vac/v1/chat" (see README)
      teaserDelay: 3000,
    };
    const inject = () => {
      for (const src of SCRIPTS) {
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        document.body.append(s);
      }
    };
    // Wait until the first contentful paint has been presented, then for idle time (at most 1 s), so these
    // scripts and the model frames they fetch don't compete with the hero image for bandwidth and main-thread
    // time. Falls back to 1.5 s where paint timing isn't reported.
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      if ("requestIdleCallback" in window) requestIdleCallback(inject, { timeout: 1000 });
      else setTimeout(inject, 1);
    };
    const fallback = setTimeout(start, 1500);
    try {
      new PerformanceObserver((list, obs) => {
        if (list.getEntriesByName("first-contentful-paint").length) { obs.disconnect(); clearTimeout(fallback); start(); }
      }).observe({ type: "paint", buffered: true });
    } catch { /* paint timing not supported: the fallback runs */ }
  }, []);
  return null;
}
