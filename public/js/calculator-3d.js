/* Platform calculator with the standalone 3D body viewer. VA math and calculator controls are preserved. */
(() => {
  "use strict";

  const root = document.getElementById("tt");
  if (!root) return;

  // Original platform body parts, including individual joints.
  const ARM = ["Shoulder", "UpperArm", "Elbow", "Forearm", "Wrist", "Hand"];
  const LEG = ["Hip", "Thigh", "Knee", "LowerLeg", "Ankle", "Foot"];
  const WORDS = { Shoulder: "shoulder", UpperArm: "upper arm", Elbow: "elbow", Forearm: "forearm", Wrist: "wrist", Hand: "hand", Hip: "hip", Thigh: "thigh", Knee: "knee", LowerLeg: "lower leg", Ankle: "ankle", Foot: "foot" };
  const CORE = ["head", "neck", "chest", "abdomen", "upperBack", "lowerBack"];
  const PART_NAMES = { head: "Head & face", neck: "Neck", chest: "Chest", abdomen: "Abdomen", upperBack: "Upper back", lowerBack: "Lower back" };
  // Arms and legs carry a limb and side so the VA bilateral factor applies (shoulders and hips count as arms and legs).
  const LIMBS = {};
  ["right", "left"].forEach(s => [...ARM, ...LEG].forEach(p => {
    PART_NAMES[s + p] = `${s === "right" ? "Right" : "Left"} ${WORDS[p]}`;
    LIMBS[s + p] = [ARM.includes(p) ? "upper" : "lower", s === "right" ? "R" : "L"];
  }));
  // Keyboard order through the body, head to feet.
  const ORDER = ["head", "neck", "rightShoulder", "leftShoulder", "chest", "upperBack", "rightUpperArm", "leftUpperArm", "rightElbow", "leftElbow",
    "abdomen", "lowerBack", "rightForearm", "leftForearm", "rightWrist", "leftWrist", "rightHand", "leftHand", "rightHip", "leftHip",
    "rightThigh", "leftThigh", "rightKnee", "leftKnee", "rightLowerLeg", "leftLowerLeg", "rightAnkle", "leftAnkle", "rightFoot", "leftFoot"];

  // Original platform condition names and identifiers.
  const CONDS = {
    mentalHealth: { name: "Mental health", head: "brain" },
    tinnitus: { name: "Tinnitus", head: "ears" },
    hearing: { name: "Hearing loss", head: "ears" },
    migraine: { name: "Migraine", head: "forehead" },
    tbi: { name: "TBI", head: "brain" },
    sleep: { name: "Sleep apnea", regions: ["neck"] },
    breathing: { name: "Asthma", regions: ["chest", "upperBack"] },
    heart: { name: "Heart / blood pressure", regions: ["chest"] },
    digestive: { name: "GERD / digestive", regions: ["abdomen"] },
    skin: { name: "Skin / scars", regions: [] },
    other: { name: "Other", regions: [] },
  };
  const COND_NAMES = Object.fromEntries(Object.entries(CONDS).map(([k, c]) => [k, c.name]));
  const money = v => v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const money0 = v => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const el = {
    body: document.getElementById("vacBody"),
    part: document.getElementById("bodyPart"),
    selection: document.getElementById("bodySelection"),
    view: document.getElementById("ttView"),
    angle: document.getElementById("ttAngle"),
    meter: document.getElementById("sevMeter"),
    sevText: document.getElementById("sevText"),
    sevMax: document.getElementById("sevMax"),
    add: document.getElementById("addCond"),
    list: document.getElementById("condsList"),
    title: document.getElementById("condsTitle"),
    empty: document.getElementById("condsEmpty"),
    live: document.getElementById("calcLive"),
    estRating: document.getElementById("estRating"),
    estExact: document.getElementById("estExact"),
    clear: document.getElementById("clearConds"),
    pay: {
      dollars: document.getElementById("payDollars"), cents: document.getElementById("payCents"), text: document.getElementById("payText"),
      year: document.getElementById("payYear"), bar: document.getElementById("payBar"),
      base: document.getElementById("payBase"), baseLabel: document.getElementById("payBaseLabel"),
      adds: Object.fromEntries([...document.querySelectorAll("[data-add]")].map(n => [n.dataset.add, n])),
    },
    mathSteps: document.getElementById("mathSteps"),
    mathFacts: document.getElementById("mathFacts"),
    progress: [...document.querySelectorAll(".calc__progress li")],
  };


  const state = {
    sex: "male",
    angle: 0,
    active: { type: "part", id: "leftKnee" },
    effect: "Limited motion",
    rating: 70,
    conds: [],
    household: { spouse: false, aid: false, kids: 0, school: 0, parents: 0 },
    householdTouched: false,
  };


  const norm = a => ((a % 360) + 360) % 360;
  const areaOf = sel => {
    if (!sel) return 'none';
    if (sel.type === 'cond') return ({mentalHealth:'ptsd',tbi:'ptsd',tinnitus:'tinnitus',hearing:'tinnitus',migraine:'migraine',sleep:'apnea',breathing:'apnea',heart:'apnea'})[sel.id] || 'other';
    if (/Back$/.test(sel.id)) return 'back';
    if (sel.id === 'head') return 'migraine';
    if (sel.id === 'neck' || sel.id === 'chest') return 'apnea';
    if (sel.id === 'abdomen') return 'other';
    const side = sel.id.startsWith('left') ? 'l' : 'r';
    return side + (/Foot$|Ankle$/.test(sel.id) ? 'foot' : ARM.some(p => sel.id.endsWith(p)) ? 'arm' : 'leg');
  };
  function render() {
    const area = areaOf(state.active);
    if (el.body.getAttribute('area') !== area) el.body.setAttribute('area', area);
    const est = estimate();
    el.body.setAttribute('marks', JSON.stringify(state.conds.map(c => ({ a: areaOf(c), p: c.pct, b: est.isBilateral(c) }))));
    el.part.value = state.active?.type === 'part' ? state.active.id : '';
    el.selection.textContent = state.active ? (state.active.type === 'part' ? PART_NAMES[state.active.id] : COND_NAMES[state.active.id]) : 'Select a body part';
  }
  function viewName(a) {
    return ['Front','Front right','Right side','Back right','Back','Back left','Left side','Front left'][Math.round(norm(a)/45)%8];
  }
  function updateAngle(a) {
    state.angle = norm(a);
    el.view.textContent = viewName(state.angle);
    el.angle.textContent = Math.round(state.angle) + '°';
  }
  function setAngle(a) {
    updateAngle(a);
    el.body.azT = a * Math.PI / 180;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) el.body.az = el.body.azT;
  }
  function select(sel) {
    if (!sel || !(sel.type === 'part' ? PART_NAMES[sel.id] : CONDS[sel.id])) return;
    state.active = sel;
    syncPicks();
    applyLevels();
    render();
    el.live.textContent = el.selection.textContent + ' selected. Set its rating and add the condition.';
  }
  function partAt(area, height = .5) {
    const h = Number.isFinite(height) ? height : .5;
    const side = area[0] === 'l' ? 'left' : 'right';
    if (area === 'larm' || area === 'rarm') {
      return side + (h > .78 ? 'Shoulder' : h > .68 ? 'UpperArm' : h > .61 ? 'Elbow' : h > .52 ? 'Forearm' : h > .48 ? 'Wrist' : 'Hand');
    }
    if (area === 'lleg' || area === 'rleg') {
      return side + (h > .49 ? 'Hip' : h > .32 ? 'Thigh' : h > .25 ? 'Knee' : h > .10 ? 'LowerLeg' : 'Ankle');
    }
    if (area === 'lfoot' || area === 'rfoot') return side + (h > .07 ? 'Ankle' : 'Foot');
    if (area === 'back') return h > .62 ? 'upperBack' : 'lowerBack';
    if (area === 'ptsd' || area === 'migraine') return 'head';
    if (area === 'apnea') return h > .82 ? 'neck' : 'chest';
    return h > .62 ? 'chest' : 'abdomen';
  }
  el.body.addEventListener('vac-area', e => {
    select(e.detail.area === 'tinnitus' ? {type:'cond',id:'tinnitus'} : {type:'part',id:partAt(e.detail.area,e.detail.height)});
  });
  el.body.addEventListener('vac-turn', e => updateAngle(e.detail.angle));
  el.body.addEventListener('vac-ready', render);
  for (const id of ORDER) {
    const option = document.createElement('option'); option.value = id; option.textContent = PART_NAMES[id]; el.part.append(option);
  }
  el.part.addEventListener('change', () => { if (el.part.value) select({type:'part',id:el.part.value}); });
  root.addEventListener('keydown', ev => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(ev.key)) return;
    ev.preventDefault(); ev.stopPropagation();
    if (ev.key === 'Home') setAngle(0);
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') setAngle(el.body.azT * 180 / Math.PI + (ev.key === 'ArrowLeft' ? -22.5 : 22.5));
    else {
      const at = ORDER.indexOf(state.active?.id);
      select({type:'part',id:ORDER[(at + (ev.key === 'ArrowDown' ? 1 : ORDER.length-1)) % ORDER.length]});
    }
  }, true);
  document.querySelectorAll('[data-turn]').forEach(b => b.addEventListener('click', () => setAngle(el.body.azT * 180 / Math.PI + Number(b.dataset.turn)*22.5)));
  document.querySelectorAll('[data-model-sex]').forEach(b => b.addEventListener('click', () => {
    state.sex = b.dataset.modelSex;
    el.body.setAttribute('model', '/assets/calculator/model-' + state.sex + '.js');
    document.querySelectorAll('[data-model-sex]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  }));
  function syncPicks() {
    document.querySelectorAll(".pick__btn").forEach(b => {
      const on = state.active?.type === "cond" && state.active.id === b.dataset.cond;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("is-added", state.conds.some(c => c.type === "cond" && c.id === b.dataset.cond));
    });
  }
  document.querySelectorAll(".pick__btn").forEach(b => b.addEventListener("click", () => select({ type: "cond", id: b.dataset.cond })));

  // Effect chips
  const chips = [...document.querySelectorAll(".chip")];
  chips.forEach(c => c.addEventListener("click", () => {
    state.effect = c.dataset.effect;
    chips.forEach(o => o.setAttribute("aria-pressed", String(o === c)));
  }));

  // VA rating meter: 10 segments = 10% to 100%. Levels the VA can't assign for the marked part or condition
  // are struck out (tinnitus is 10% only, a knee tops out at 60%...), so every estimate is a real VA rating.
  const ALL = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const kindOf = id => id.replace(/^(right|left)/, "");
  const levelsOf = sel => {
    const lv = window.VAMath.LEVELS;
    return (sel && (sel.type === "part" ? lv.parts[kindOf(sel.id)] : lv.conds[sel.id])) || ALL;
  };
  state.levels = ALL;
  const segs = [];
  for (let i = 1; i <= 10; i++) {
    const s = document.createElement("button");
    s.type = "button"; s.className = "sev__seg"; s.setAttribute("role", "radio");
    s.setAttribute("aria-label", `${i * 10} percent`);
    s.addEventListener("click", () => { if (state.levels.includes(i * 10)) setRating(i * 10); });
    s.addEventListener("keydown", ev => {
      const lv = state.levels, at = lv.indexOf(state.rating);
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { ev.preventDefault(); setRating(lv[Math.min(lv.length - 1, at + 1)], true); }
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { ev.preventDefault(); setRating(lv[Math.max(0, at - 1)], true); }
    });
    el.meter.append(s); segs.push(s);
  }
  function setRating(v, focus) {
    state.rating = v;
    const n = v / 10;
    segs.forEach((s, i) => { s.classList.toggle("is-on", i < n); s.setAttribute("aria-checked", String(i + 1 === n)); s.tabIndex = i + 1 === n ? 0 : -1; });
    el.sevText.textContent = `${v}%`;
    if (focus) segs[n - 1].focus();
  }
  function applyLevels() {
    const lv = state.levels = levelsOf(state.active);
    segs.forEach((s, i) => { const ok = lv.includes((i + 1) * 10); s.classList.toggle("is-off", !ok); s.setAttribute("aria-disabled", String(!ok)); });
    el.sevMax.textContent = lv.length === ALL.length ? "" : lv.length === 1 ? `${lv[0]}% only` : `Max ${lv[lv.length - 1]}%`;
    // Keep the chosen rating if it's valid here, otherwise the closest valid one (the lower on a tie).
    if (!lv.includes(state.rating)) setRating(lv.reduce((b, v) => (Math.abs(v - state.rating) < Math.abs(b - state.rating) ? v : b), lv[0]));
  }
  setRating(state.rating);
  applyLevels();

  // Conditions list. The same part can hold more than one rating (a knee and an ankle on one leg, say).
  let nextId = 1;
  el.add.addEventListener("click", () => {
    const a = state.active;
    if (!a) { el.live.textContent = "Mark a body part or a condition first."; return; }
    const name = a.type === "part" ? PART_NAMES[a.id] : COND_NAMES[a.id];
    const [limb, side] = (a.type === "part" && LIMBS[a.id]) || [];
    state.conds.push({ ...a, key: nextId++, name, effect: state.effect, pct: state.rating, limb, side });
    renderConds();
    const est = estimate();
    el.live.textContent = `${name} at ${state.rating}% added. Combined rating ${est.rating}%, about ${money(est.pay)} a month.`;
  });
  function renderConds() {
    const est = estimate();
    el.list.replaceChildren(...state.conds.map((c, i) => {
      const li = document.createElement("li");
      const bi = est.isBilateral(c);
      li.classList.toggle("is-bilateral", bi);
      li.title = bi ? `${c.effect}. Both sides rated, so the bilateral factor applies.` : c.effect;
      const t = document.createElement("span");
      t.className = "conds__name";
      t.textContent = `${String(i + 1).padStart(2, "0")} ${c.name}`;
      const p = document.createElement("span");
      p.className = "conds__pct";
      p.textContent = `${c.pct}%`;
      if (bi) { const s = document.createElement("span"); s.className = "sr-only"; s.textContent = ", bilateral"; p.append(s); }
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "x"; x.setAttribute("aria-label", `Remove ${c.name}, ${c.pct} percent`);
      x.addEventListener("click", () => {
        state.conds = state.conds.filter(o => o.key !== c.key);
        renderConds();
        el.live.textContent = `${c.name} removed.`;
        el.add.focus();
      });
      li.append(t, p, x);
      return li;
    }));
    el.title.textContent = `Your conditions (${state.conds.length})`;
    el.empty.hidden = state.conds.length > 0;
    el.clear.hidden = !state.conds.length;
    syncPicks();
    renderEstimate(est);
    render();
  }

  // Clear all: empties the list (household stays as set).
  el.clear.addEventListener("click", () => {
    const n = state.conds.length;
    state.conds = [];
    renderConds();
    el.live.textContent = `${n} conditions removed.`;
    el.add.focus();
  });

  // Estimate: the dog tag (rating), the pay receipt, the math, and the step pills.
  const estimate = () => window.VAMath.estimate(state.conds, state.household);
  const HOUSE = ["spouse", "aid", "kids", "school", "parents"];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let shownPay = 0, payAnim = 0, lastItems = {};

  function renderEstimate(est = estimate()) {
    const has = state.conds.length > 0;
    el.estRating.textContent = `${est.rating}%`;
    el.estExact.textContent = has ? `Exact ${est.exact}%` : "Add a condition";
    renderPay(est);

    el.mathSteps.replaceChildren(...(est.steps.length ? est.steps : ["Add a condition to see the math."]).map(s => {
      const li = document.createElement("li"); li.textContent = s; return li;
    }));
    el.mathFacts.textContent = state.conds.length > 1
      ? `Adding them up would say ${est.naive}%. The VA combines instead, so each rating counts only against what's left.`
      : "";
    const done = [true, has, state.householdTouched, est.rating > 0];
    el.progress.forEach((p, i) => { p.classList.toggle("is-on", done[i]); p.toggleAttribute("aria-current", false); });
    const at = done.lastIndexOf(true);
    el.progress[at]?.setAttribute("aria-current", "step");
    fitStage();
  }

  // Pay receipt: big monthly figure (counts to the new value), a bar split into rating pay vs household,
  // and on every household row what that person adds right now.
  function renderPay(est) {
    const P = el.pay, it = est.items, low = est.rating < 30;
    P.text.textContent = `${money(est.pay)} a month`;
    P.year.textContent = est.pay ? `${money0(est.pay * 12)} a year` : "Add a condition to start";
    P.baseLabel.textContent = est.rating ? `${est.rating}% VA rating` : "No rating yet";
    P.base.textContent = est.rating ? money(it.base) : "—";

    const set = { spouse: state.household.spouse, aid: state.household.aid, kids: state.household.kids > 0, school: state.household.school > 0, parents: state.household.parents > 0 };
    HOUSE.forEach(k => {
      const n = P.adds[k]; if (!n) return;
      const v = it[k];
      n.textContent = v ? `+${money(v)}` : set[k] && low ? "at 30%+" : "—";
      n.classList.toggle("is-on", v > 0);
      n.classList.toggle("is-wait", !v && set[k]);
      if (v !== (lastItems[k] || 0) && v > 0) bump(n);
    });
    lastItems = { ...it };

    // Bar: one segment per item, widths as a share of the month.
    const parts = [["base", it.base], ...HOUSE.map(k => [k, it[k]])].filter(([, v]) => v > 0);
    const keep = new Map([...P.bar.children].map(c => [c.dataset.k, c]));
    P.bar.replaceChildren(...parts.map(([k, v]) => {
      const seg = keep.get(k) || Object.assign(document.createElement("span"), { className: k === "base" ? "is-base" : "" });
      seg.dataset.k = k;
      seg.style.flexGrow = String(v);
      return seg;
    }));
    P.bar.classList.toggle("is-empty", !parts.length);

    countTo(est.pay);
  }
  function bump(n) { n.classList.remove("is-bump"); void n.offsetWidth; n.classList.add("is-bump"); }
  function showPay(v) {
    const [d, c] = money(v).split(".");
    el.pay.dollars.textContent = d;
    el.pay.cents.textContent = `.${c}`;
  }
  function countTo(target) {
    cancelAnimationFrame(payAnim);
    const from = shownPay, t0 = performance.now(), dur = reduceMotion.matches || from === target ? 0 : 520;
    const step = now => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1;
      shownPay = from + (target - from) * (1 - Math.pow(1 - t, 3));
      if (t >= 1) shownPay = target;
      showPay(shownPay);
      if (t < 1) payAnim = requestAnimationFrame(step);
    };
    if (dur) payAnim = requestAnimationFrame(step); else step(t0);
  }

  // The desktop section is a fixed-height composition; let it grow when the receipt (with the math open) runs long.
  const stage = root.closest(".stage"), mathBox = document.getElementById("math"), receipt = document.querySelector(".pay-wrap");
  const wide = matchMedia("(min-width: 861px)");
  function fitStage() {
    if (!stage || !receipt) return;
    stage.style.removeProperty("height");
    if (!wide.matches) return;
    const top = stage.getBoundingClientRect().top;
    const scale = stage.getBoundingClientRect().width / 1280;
    const builder = document.querySelector('.calc__builder');
    const tag = document.querySelector('.calc__tag');
    const cta = stage.querySelector('a[href="#evaluation"]');
    const note = stage.querySelector('.calc__note');
    // Added body-part controls and a growing condition list need space above the estimate tag.
    tag.style.setProperty('--y', String(Math.max(1040, (builder.getBoundingClientRect().bottom - top) / scale + 32)));
    const footerY = Math.max(1420, (tag.getBoundingClientRect().bottom - top) / scale + 48);
    cta.style.setProperty('--y', String(footerY));
    note.style.setProperty('--y', String(footerY + 70));
    const need = Math.max(receipt.getBoundingClientRect().bottom - top + 64, (footerY + 140) * scale);
    if (need > stage.getBoundingClientRect().height) stage.style.height = `${Math.ceil(need)}px`;
  }
  mathBox?.addEventListener("toggle", fitStage);
  wide.addEventListener("change", fitStage);

  // Household (adds pay from a 30% combined rating up)
  const H = state.household;
  const spouse = document.getElementById("spouse"), aid = document.getElementById("spouseAid"), aaRow = document.getElementById("aaRow");
  const toggle = (btn, on) => { btn.setAttribute("aria-pressed", String(on)); btn.textContent = on ? "[ On ]" : "[ Off ]"; };
  const houseChanged = what => {
    state.householdTouched = true;
    renderConds();
    const est = estimate();
    el.live.textContent = `${what}. ${est.rating >= 30 ? `About ${money(est.pay)} a month.` : "Household adds pay from a 30% rating."}`;
  };
  spouse?.addEventListener("click", () => {
    H.spouse = !H.spouse;
    if (!H.spouse) H.aid = false;
    toggle(spouse, H.spouse); toggle(aid, H.aid);
    aaRow.hidden = !H.spouse;
    houseChanged(`Spouse ${H.spouse ? "on" : "off"}`);
  });
  aid?.addEventListener("click", () => { H.aid = !H.aid; toggle(aid, H.aid); houseChanged(`Spouse aid ${H.aid ? "on" : "off"}`); });
  const MAX = { kids: 10, school: 10, parents: 2 };
  const COUNT_NAMES = { kids: "Children under 18", school: "Children in school", parents: "Dependent parents" };
  document.querySelectorAll("[data-count]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.count;
    H[k] = Math.max(0, Math.min(MAX[k], H[k] + Number(b.dataset.step)));
    const out = document.getElementById(k);
    out.value = out.textContent = String(H[k]);
    houseChanged(`${COUNT_NAMES[k]}: ${H[k]}`);
  }));

  syncPicks();
  applyLevels();
  renderEstimate();
  render();
  updateAngle(0);
  window.addEventListener('resize', fitStage, {passive:true});
  window.vacCalculator = {setAngle,select,estimate,getState:()=>JSON.parse(JSON.stringify({...state,drag:null}))};
})();
