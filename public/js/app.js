/* VAC V4: menu, intake steps, contact form, story player. Forms post to /api/* (serve.mjs), which emails them over SMTP. */
(() => {
  "use strict";

  // ---------- mobile menu ----------
  const menu = document.getElementById("menu");
  const openBtn = document.querySelector(".nav .nav__menu");
  const closeBtn = document.getElementById("menuClose");
  const setMenu = open => {
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    (open ? closeBtn : openBtn).focus();
  };
  openBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  menu?.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });
  matchMedia("(min-width: 861px)").addEventListener("change", e => { if (e.matches && !menu.hidden) setMenu(false); });

  // ---------- helpers ----------
  const showError = (box, msg, focusEl) => {
    box.textContent = msg;
    box.hidden = !msg;
    if (msg && focusEl) focusEl.focus();
  };
  const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const phoneOK = v => v.replace(/\D/g, "").length >= 10;
  const FAIL = "We couldn't send that right now. Please try again, or call +1 877-822-2023.";
  const post = async (url, data) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || !body.ok) throw new Error(body.error || FAIL);
  };

  // ---------- intake (3 steps) ----------
  const intake = document.getElementById("intakeForm");
  if (intake) {
    const steps = [...intake.querySelectorAll(".step")];
    const items = [...intake.querySelectorAll(".stepper__item")];
    const lines = [...intake.querySelectorAll(".stepper__line")];
    const back = document.getElementById("intakeBack");
    const next = document.getElementById("intakeNext");
    const count = document.getElementById("intakeCount");
    const err = document.getElementById("intakeError");
    let step = 1;

    const go = n => {
      step = n;
      steps.forEach(s => { s.hidden = Number(s.dataset.step) !== n; });
      items.forEach((it, i) => {
        it.classList.toggle("is-on", i + 1 === n);
        it.classList.toggle("is-done", i + 1 < n);
        it.querySelector(".stepper__box").textContent = i + 1 < n ? "✓" : String(i + 1);
        if (i + 1 === n) it.setAttribute("aria-current", "step"); else it.removeAttribute("aria-current");
      });
      lines.forEach((l, i) => l.classList.toggle("is-done", i + 1 < n));
      back.hidden = n === 1;
      next.textContent = n === 3 ? "Submit →" : "Next →";
      count.textContent = `Step ${n} of 3`;
      showError(err, "");
      intake.querySelectorAll(".is-invalid").forEach(q => q.classList.remove("is-invalid"));
    };

    const validate = () => {
      const current = steps[step - 1];
      let first = null;
      current.querySelectorAll(".q").forEach(q => {
        const inputs = q.querySelectorAll("input[type=radio]");
        const ok = [...inputs].some(i => i.checked);
        q.classList.toggle("is-invalid", !ok);
        inputs.forEach(i => i.setAttribute("aria-invalid", String(!ok)));
        if (!ok && !first) first = inputs[0];
      });
      current.querySelectorAll(".input[required]").forEach(i => {
        const v = i.value;
        const ok = i.type === "email" ? emailOK(v) : i.type === "tel" ? phoneOK(v) : v.trim().length > 1;
        i.setAttribute("aria-invalid", String(!ok));
        if (!ok && !first) first = i;
      });
      if (first) {
        const msg = step === 3 ? "Please add your name, a valid email, a 10-digit phone number and your disability status." : "Please answer both questions to continue.";
        showError(err, msg, first);
        return false;
      }
      return true;
    };

    intake.addEventListener("change", e => {
      const q = e.target.closest(".q");
      if (q && q.classList.contains("is-invalid")) { q.classList.remove("is-invalid"); q.querySelectorAll("input").forEach(i => i.removeAttribute("aria-invalid")); }
    });
    intake.addEventListener("input", e => { if (e.target.getAttribute("aria-invalid") === "true") e.target.removeAttribute("aria-invalid"); });
    back.addEventListener("click", () => { go(step - 1); steps[step - 1].querySelector("input")?.focus(); });
    intake.addEventListener("submit", async e => {
      e.preventDefault();
      if (next.disabled || !validate()) return;
      if (step < 3) { go(step + 1); steps[step - 1].querySelector("input")?.focus(); return; }
      const data = Object.fromEntries(new FormData(intake));
      next.disabled = back.disabled = true;
      next.textContent = "Sending…";
      try { await post("/api/intake", data); }
      catch (ex) {
        next.disabled = back.disabled = false;
        next.textContent = "Submit →";
        showError(err, ex.message || FAIL, next);
        return;
      }
      intake.dispatchEvent(new CustomEvent("vac:intake", { detail: data, bubbles: true }));
      steps.forEach(s => (s.hidden = true));
      intake.querySelector(".intake__actions").hidden = true;
      items.forEach(it => { it.classList.remove("is-on"); it.classList.add("is-done"); it.querySelector(".stepper__box").textContent = "✓"; });
      lines.forEach(l => l.classList.add("is-done"));
      const done = document.getElementById("intakeDone");
      done.hidden = false;
      done.focus();
    });
    go(1);
  }

  // ---------- contact form ----------
  const contact = document.getElementById("contactForm");
  if (contact) {
    const err = document.getElementById("contactError");
    contact.addEventListener("input", e => { if (e.target.getAttribute("aria-invalid") === "true") e.target.removeAttribute("aria-invalid"); });
    const send = contact.querySelector("button[type=submit]");
    contact.addEventListener("submit", async e => {
      e.preventDefault();
      if (send.disabled) return;
      const name = contact.elements.name, email = contact.elements.email, phone = contact.elements.phone;
      const bad = [];
      if (name.value.trim().length < 2) bad.push(name);
      if (!emailOK(email.value)) bad.push(email);
      if (phone.value.trim() && !phoneOK(phone.value)) bad.push(phone);
      [name, email, phone].forEach(i => i.setAttribute("aria-invalid", String(bad.includes(i))));
      if (bad.length) { showError(err, "Please add your name and a valid email. Phone is optional but needs 10 digits.", bad[0]); return; }
      showError(err, "");
      const data = Object.fromEntries(new FormData(contact));
      send.disabled = true;
      send.textContent = "Sending…";
      try { await post("/api/contact", data); }
      catch (ex) {
        send.disabled = false;
        send.textContent = "Send →";
        showError(err, ex.message || FAIL, send);
        return;
      }
      contact.dispatchEvent(new CustomEvent("vac:contact", { detail: data, bubbles: true }));
      [...contact.children].forEach(c => { if (c.id !== "contactDone" && !c.matches(".mono")) c.hidden = true; });
      const done = document.getElementById("contactDone");
      done.hidden = false;
      done.focus();
    });
  }

  // ---------- trust: ball chain across the full width, tags hung where it passes ----------
  const trust = document.querySelector(".sec--trust");
  const chain = document.getElementById("trustChain");
  const desktop = matchMedia("(min-width: 861px)");
  const SVGNS = "http://www.w3.org/2000/svg";
  function hangChain() {
    if (!trust || !chain || !desktop.matches) return;
    const W = trust.clientWidth;
    const sw = trust.querySelector(".stage").getBoundingClientRect().width; // 1280 design units
    const u = sw / 1280, colLeft = (W - sw) / 2;
    const sag = 40 * Math.min(1.6, Math.sqrt(W / sw)); // design units; a touch deeper on wide screens
    const chainY = xs => 6 + sag * Math.sin(Math.PI * Math.min(Math.max(xs / W, 0), 1)); // design units below 470
    const H = (sag + 12) * u, r = 3.4 * u, step = 10 * u;
    let d = "";
    for (let x = step / 2; x < W; x += step) {
      const y = chainY(x) * u;
      d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
    }
    chain.setAttribute("viewBox", `0 0 ${W} ${H.toFixed(1)}`);
    chain.setAttribute("width", String(W));
    chain.setAttribute("height", H.toFixed(1));
    let path = chain.firstElementChild;
    if (!path) { path = document.createElementNS(SVGNS, "path"); path.setAttribute("fill", "#77818a"); chain.append(path); }
    path.setAttribute("d", d);
    trust.querySelectorAll(".tag").forEach(tag => {
      const x = parseFloat(tag.style.getPropertyValue("--x"));
      const rot = parseFloat(tag.style.getPropertyValue("--r")) * Math.PI / 180;
      // The link's top is the tag box's top-centre, rotated about the box centre (250 x 220).
      const linkX = x + 125 + 110 * Math.sin(rot);
      const y = 470 + chainY(colLeft + linkX * u) + 3 - 110 * (1 - Math.cos(rot));
      tag.style.setProperty("--y", y.toFixed(1));
    });
  }
  let chainFrame = 0;
  const queueChain = () => { cancelAnimationFrame(chainFrame); chainFrame = requestAnimationFrame(hangChain); };
  hangChain();
  window.addEventListener("resize", queueChain, { passive: true });
  desktop.addEventListener("change", queueChain);

  // ---------- stories: tape rack loads the viewfinder; the story plays in place ----------
  const reel = document.querySelector(".sec--stories");
  if (reel) {
    const $ = id => document.getElementById(id);
    const tapes = [...reel.querySelectorAll(".vhs")];
    const screen = $("vfScreen"), still = $("vfStill"), video = $("vfVideo"), vfPlay = $("vfPlay"), vfErr = $("vfError");
    const state = $("vfState"), time = $("vfTime"), tapeTag = $("vfTape"), ghost = $("reelGhost");
    const nameEl = $("reelName"), metaEl = $("reelMeta"), lineEl = $("reelLine"), numEl = $("reelNum"), durEl = $("reelDur");
    const pad = n => String(n).padStart(2, "0");
    const clock = s => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;
    const longClock = d => `${pad(d.split(":")[0])}:${d.split(":")[1]}`;
    let current = 0;

    const stop = () => {
      video.pause();
      video.hidden = true;
      video.removeAttribute("src");
      video.load();
      screen.classList.remove("is-playing");
      state.textContent = "STBY";
    };

    const select = (n, { announce = true } = {}) => {
      stop();
      current = (n + tapes.length) % tapes.length;
      const d = tapes[current].dataset;
      tapes.forEach((t, k) => t.setAttribute("aria-pressed", String(k === current)));
      still.src = d.still;
      still.alt = `${d.name}, still from his video story`;
      nameEl.textContent = d.name;
      metaEl.textContent = d.meta || "";
      metaEl.hidden = !d.meta;
      lineEl.textContent = d.line;
      numEl.textContent = pad(current + 1);
      durEl.textContent = d.dur;
      time.textContent = `00:00 / ${longClock(d.dur)}`;
      tapeTag.textContent = `Tape ${pad(current + 1)}`;
      vfPlay.setAttribute("aria-label", `Play ${d.name}'s story, ${d.durLong}`);
      vfErr.hidden = true;
      ghost.textContent = d.name.split(" ")[0];
      // A quick tape-change flicker on the screen and a slide on the background name.
      for (const [el, cls] of [[screen, "is-switching"], [ghost, "is-in"]]) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
      if (!announce) nameEl.removeAttribute("aria-live"); else nameEl.setAttribute("aria-live", "polite");
    };

    const play = () => {
      const d = tapes[current].dataset;
      vfErr.hidden = true;
      video.src = d.video;
      video.controls = true;
      video.hidden = false;
      screen.classList.add("is-playing");
      state.textContent = "REC";
      video.play().catch(() => {});
      video.focus();
    };

    video.addEventListener("timeupdate", () => { if (video.duration) time.textContent = `${clock(video.currentTime)} / ${clock(video.duration)}`; });
    video.addEventListener("ended", () => { stop(); vfPlay.focus(); });
    video.addEventListener("error", () => { if (!video.getAttribute("src")) return; stop(); vfErr.hidden = false; });
    vfPlay.addEventListener("click", play);
    $("reelPlay").addEventListener("click", play);
    reel.querySelectorAll(".reel-sq").forEach(b => b.addEventListener("click", () => select(current + Number(b.dataset.step))));
    tapes.forEach((t, k) => t.addEventListener("click", () => select(k)));
    // Arrow keys move through the rack like a list.
    reel.querySelector(".tapes").addEventListener("keydown", e => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const from = tapes.indexOf(document.activeElement);
      select((from >= 0 ? from : current) + step);
      tapes[current].focus();
    });
    select(0, { announce: false });
    screen.classList.remove("is-switching");
    ghost.classList.remove("is-in");
  }
})();
