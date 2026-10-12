/* VAC V4 calculator: 3D body map (<vac-body-map>, assets/calculator/) + the VA combined-ratings maths
   from the VAC calculator (38 CFR 4.25–4.26, bilateral factor, 2026 compensation rates). */
(() => {
  "use strict";

  const body = document.getElementById("body");
  if (!body) return;
  const $ = id => document.getElementById(id);

  // ---------------------------------------------------------------- data
  // Area keys are shared with <vac-body-map>. side/limb drive the bilateral factor.
  const AREAS = {
    back: { name: "Back" }, ptsd: { name: "PTSD" }, tinnitus: { name: "Tinnitus" }, migraine: { name: "Migraine" },
    apnea: { name: "Sleep apnea" }, other: { name: "Other" },
    larm: { name: "Left arm", side: "L", limb: "upper" }, rarm: { name: "Right arm", side: "R", limb: "upper" },
    lleg: { name: "Left leg", side: "L", limb: "lower" }, rleg: { name: "Right leg", side: "R", limb: "lower" },
    lfoot: { name: "Left foot", side: "L", limb: "lower" }, rfoot: { name: "Right foot", side: "R", limb: "lower" },
  };
  // 2026 VA rates (effective Dec 1, 2025). a = veteran alone; s = spouse; p = per parent; c = first child (no spouse);
  // cs = first child (with spouse); u = each additional child under 18; sc = each child 18–23 in school; aa = spouse A&A.
  const RATES = {
    10: { a: 180.42 }, 20: { a: 356.66 },
    30: { a: 552.47, s: 65, p: 52, c: 44, cs: 49, u: 32, sc: 105, aa: 61 },
    40: { a: 795.84, s: 87, p: 70, c: 58, cs: 65, u: 43, sc: 140, aa: 81 },
    50: { a: 1132.90, s: 109, p: 88, c: 73, cs: 81, u: 54, sc: 176, aa: 101 },
    60: { a: 1435.02, s: 131, p: 105, c: 88, cs: 97, u: 65, sc: 211, aa: 121 },
    70: { a: 1808.45, s: 153, p: 123, c: 102, cs: 113, u: 76, sc: 246, aa: 141 },
    80: { a: 2102.15, s: 175, p: 140, c: 117, cs: 129, u: 87, sc: 281, aa: 161 },
    90: { a: 2362.30, s: 197, p: 158, c: 132, cs: 145, u: 98, sc: 317, aa: 181 },
    100: { a: 3938.58, s: 219.59, p: 176.24, c: 146.85, cs: 160.82, u: 109.11, sc: 352.45, aa: 201.41 },
  };
  const MAX = { kids: 10, school: 10, parents: 2 };

  const state = {
    area: "lleg",
    nextId: 4,
    ratings: [{ id: 1, pct: 50, area: "ptsd" }, { id: 2, pct: 30, area: "back" }, { id: 3, pct: 10, area: "tinnitus" }],
    spouse: true, aa: false, kids: 2, school: 0, parents: 0,
  };

  // ---------------------------------------------------------------- maths
  function combine(vals) {
    let combined = 0;
    const steps = [];
    vals.slice().sort((a, b) => b - a).forEach((r, i) => {
      const remaining = 100 - combined;
      const next = Math.round(combined + remaining * r / 100);
      steps.push(i === 0 ? `Start with your highest rating: ${r}%` : `${r}% of the remaining ${remaining}% → ${next}% combined`);
      combined = next;
    });
    return { value: combined, steps };
  }

  function compute() {
    const S = state;
    const hasSide = (limb, side) => S.ratings.some(r => AREAS[r.area].limb === limb && AREAS[r.area].side === side);
    const pair = { upper: hasSide("upper", "L") && hasSide("upper", "R"), lower: hasSide("lower", "L") && hasSide("lower", "R") };
    const isBi = r => !!AREAS[r.area].limb && pair[AREAS[r.area].limb];
    const bi = S.ratings.filter(isBi).map(r => r.pct);
    const values = S.ratings.filter(r => !isBi(r)).map(r => r.pct);
    let steps = [], bf = 0;
    if (bi.length) {
      const b = combine(bi);
      bf = Math.round(b.value * 0.1 * 10) / 10;
      const bv = Math.round(b.value + bf);
      steps.push(`Bilateral ratings (${bi.join("%, ")}%) combine to ${b.value}%, plus a 10% bilateral factor (${bf}) = ${bv}%`);
      values.push(bv);
    }
    const c = combine(values);
    steps = steps.concat(c.steps);
    const exact = Math.min(100, c.value);
    const rating = exact === 0 ? 0 : Math.min(100, Math.round(exact / 10) * 10);
    if (S.ratings.length) steps.push(`Exact value ${exact}% rounds to a ${rating}% VA rating`);

    // Monthly pay, itemised so every household choice shows its own amount.
    const t = RATES[rating];
    const deps = rating >= 30;
    const items = [{ label: rating ? `Veteran at ${rating}%` : "Veteran (no rating yet)", amt: t ? t.a : 0, on: true }];
    const dep = (label, amt) => items.push({ label, amt: deps ? amt : 0, on: deps });
    if (S.spouse) dep("Spouse", t && t.s || 0);
    if (S.spouse && S.aa) dep("Spouse A&A", t && t.aa || 0);
    if (S.kids + S.school > 0) {
      const first = t ? (S.spouse ? t.cs : t.c) || 0 : 0;
      if (S.kids > 0) {
        dep(`Kids under 18 ×${S.kids}`, first + (S.kids - 1) * (t && t.u || 0));
        if (S.school) dep(`Kids in school ×${S.school}`, S.school * (t && t.sc || 0));
      } else {
        dep(`Kids in school ×${S.school}`, t && t.sc ? first + (t.sc - t.u) + (S.school - 1) * t.sc : 0);
      }
    }
    if (S.parents) dep(`Parents ×${S.parents}`, S.parents * (t && t.p || 0));
    const pay = items.reduce((sum, i) => sum + i.amt, 0);
    const naive = Math.min(100, S.ratings.reduce((s, r) => s + r.pct, 0));
    return { isBi, bi, bf, exact, rating, pay, items, deps, naive, steps };
  }

  // ---------------------------------------------------------------- render
  const money = v => v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const live = msg => { $("calcLive").textContent = msg; };
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Sets text and flashes it when the value actually changes, so each click visibly moves the total.
  function setText(id, v) {
    const n = $(id);
    if (n.textContent === v) return;
    n.textContent = v;
    if (!started || reduceMotion()) return;
    n.classList.remove("is-bump"); void n.offsetWidth; n.classList.add("is-bump");
  }
  let started = false;
  // The rating being edited: the latest entry for the selected part, if it has one.
  const currentRating = () => { for (let i = state.ratings.length - 1; i >= 0; i--) if (state.ratings[i].area === state.area) return state.ratings[i]; return null; };

  function render() {
    const S = state, R = compute();

    document.querySelectorAll(".pick__btn[data-area]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.area === S.area));
      b.classList.toggle("is-added", S.ratings.some(r => r.area === b.dataset.area));
    });
    const cur = currentRating();
    showMeter(cur ? cur.pct : 0);
    $("sevFor").textContent = AREAS[S.area].name;
    const add = $("addCond");
    add.disabled = !cur;
    add.textContent = "+ Add another rating";
    add.title = cur ? `Add a second ${AREAS[S.area].name.toLowerCase()} rating` : "Rate this part first";

    $("condsList").replaceChildren(...S.ratings.map((r, i) => {
      const li = document.createElement("li");
      if (R.isBi(r)) li.classList.add("is-bi");
      const t = document.createElement("span");
      t.textContent = `${String(i + 1).padStart(2, "0")} ${AREAS[r.area].name} · ${r.pct}%`;
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "x"; x.dataset.remove = String(r.id);
      x.setAttribute("aria-label", `Remove ${r.pct} percent ${AREAS[r.area].name} rating`);
      li.append(t, x);
      return li;
    }));
    $("condsTitle").textContent = `Your ratings (${S.ratings.length})`;
    $("condsEmpty").hidden = S.ratings.length > 0;

    $("mExact").textContent = `${R.exact}%`;
    $("mNaive").textContent = `${R.naive}%`;
    $("mBfRow").hidden = !R.bi.length;
    $("mBf").textContent = `+${R.bf}%`;
    $("mSteps").replaceChildren(...(R.steps.length ? R.steps : ["Add a rating to see the maths."]).map(s => {
      const li = document.createElement("li"); li.textContent = s; return li;
    }));

    $("billList").replaceChildren(...R.items.map(i => {
      const li = document.createElement("li");
      li.classList.toggle("is-off", !i.on);
      const a = document.createElement("span"), b = document.createElement("span");
      a.textContent = i.label;
      b.textContent = i.on ? money(i.amt) : "from 30%";
      li.append(a, b);
      return li;
    }));
    setText("billTotal", money(R.pay));
    $("billYear").textContent = money(R.pay * 12);
    setText("tagRating", `${R.rating}%`);
    setText("tagMonthly", money(R.pay));

    const sp = $("spouse"), aa = $("aa");
    sp.setAttribute("aria-pressed", String(S.spouse)); sp.textContent = S.spouse ? "[ On ]" : "[ Off ]";
    aa.setAttribute("aria-pressed", String(S.aa)); aa.textContent = S.aa ? "[ On ]" : "[ Off ]";
    $("aaRow").hidden = !S.spouse;
    for (const k of Object.keys(MAX)) { const o = $(k); o.value = o.textContent = String(S[k]); }

    body.setAttribute("area", S.area);
    body.setAttribute("marks", JSON.stringify(S.ratings.map(r => ({ a: r.area, p: r.pct, b: R.isBi(r) }))));
    return R;
  }

  // ---------------------------------------------------------------- rating meter (10 steps = 10%…100%)
  // Tapping a step rates the selected part straight away (or changes its rating); the totals follow at once.
  const segs = [];
  for (let i = 1; i <= 10; i++) {
    const seg = document.createElement("button");
    seg.type = "button"; seg.className = "sev__seg"; seg.setAttribute("role", "radio");
    seg.setAttribute("aria-label", `${i * 10} percent`);
    seg.addEventListener("click", () => assign(i * 10));
    seg.addEventListener("keydown", ev => {
      const cur = currentRating() ? currentRating().pct : 0;
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { ev.preventDefault(); assign(Math.min(100, cur + 10), true); }
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { ev.preventDefault(); assign(Math.max(10, cur - 10), true); }
    });
    $("sevMeter").append(seg); segs.push(seg);
  }
  function showMeter(pct) {
    const n = pct / 10;
    segs.forEach((g, i) => { g.classList.toggle("is-on", i < n); g.setAttribute("aria-checked", String(i + 1 === n)); g.tabIndex = (n ? i + 1 === n : i === 0) ? 0 : -1; });
    $("sevText").textContent = pct ? `${pct}%` : "—";
  }
  function assign(pct, focus) {
    const cur = currentRating();
    if (cur) cur.pct = pct;
    else state.ratings.push({ id: state.nextId++, pct, area: state.area });
    const R = render();
    live(`${AREAS[state.area].name} ${pct}%. Combined rating ${R.rating}%, ${money(R.pay)} a month.`);
    if (focus) segs[pct / 10 - 1].focus();
  }

  // ---------------------------------------------------------------- events
  const selectArea = key => { if (AREAS[key]) { state.area = key; render(); requestAnimationFrame(readout); } };
  document.querySelectorAll(".pick__btn[data-area]").forEach(b => b.addEventListener("click", () => selectArea(b.dataset.area)));
  body.addEventListener("vac-area", e => selectArea(e.detail && e.detail.area));

  // A second rating on the same part (e.g. two back conditions). It starts at 10% and the meter then edits it.
  $("addCond").addEventListener("click", () => {
    if (!currentRating()) return;
    state.ratings.push({ id: state.nextId++, pct: 10, area: state.area });
    const R = render();
    live(`Another ${AREAS[state.area].name} rating added at 10%. Combined rating ${R.rating}%.`);
  });
  $("condsList").addEventListener("click", e => {
    const b = e.target.closest("[data-remove]");
    if (!b) return;
    const r = state.ratings.find(x => x.id === Number(b.dataset.remove));
    state.ratings = state.ratings.filter(x => x !== r);
    const R = render();
    live(`${AREAS[r.area].name} ${r.pct}% removed. Combined rating ${R.rating}%, ${money(R.pay)} a month.`);
    $("addCond").focus();
  });

  const household = () => { const R = render(); live(`Total ${money(R.pay)} a month.`); };
  $("spouse").addEventListener("click", () => { state.spouse = !state.spouse; if (!state.spouse) state.aa = false; household(); });
  $("aa").addEventListener("click", () => { state.aa = !state.aa; household(); });
  document.querySelectorAll("[data-count]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.count;
    state[k] = Math.max(0, Math.min(MAX[k], state[k] + Number(b.dataset.step)));
    household();
  }));

  // ---------------------------------------------------------------- turning
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STEP = Math.PI / 8; // 22.5°
  function viewName(a) {
    const c = [[0, "Front"], [90, "Right side"], [180, "Back"], [270, "Left side"], [360, "Front"]];
    const n = c.reduce((b, x) => (Math.abs(x[0] - a) < Math.abs(b[0] - a) ? x : b));
    if (Math.abs(n[0] - a) <= 12) return n[1];
    return a < 90 ? "Front right" : a < 180 ? "Back right" : a < 270 ? "Back left" : "Front left";
  }
  let lastDeg = null;
  function readout() {
    if (typeof body.azT !== "number") return;
    const deg = Math.round((((body.azT * 180 / Math.PI) % 360) + 360) % 360);
    if (deg === lastDeg) return;
    lastDeg = deg;
    $("ttView").textContent = viewName(deg);
    $("ttAngle").textContent = `${deg}°`;
  }
  document.querySelectorAll("[data-turn]").forEach(b => b.addEventListener("click", () => {
    if (typeof body.azT !== "number") return;
    body.azT += Number(b.dataset.turn) * STEP;
    if (reduce()) body.az = body.azT;
    readout();
  }));
  // Drags, arrow keys and area picks all move the model; keep the readout in step.
  ["pointermove", "pointerup", "keydown", "vac-area"].forEach(t => body.addEventListener(t, () => requestAnimationFrame(readout)));

  // ---------------------------------------------------------------- start
  render();
  started = true;
  readout();

  window.vacCalculator = { getState: () => JSON.parse(JSON.stringify(state)), compute, select: selectArea, setRating: assign };
})();
