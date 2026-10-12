/* VAC V4 calculator: 2.5D turntable + body-part selection.
   Frames come from the VAC 2.5D viewer prototype (normalised to 800x1424 WebP: same height, same floor, neck on
   the centre axis). Parts are segmented at runtime from each frame's alpha channel, so the highlight follows the
   real silhouette instead of a dot. Needs http(s): canvas pixel reads are blocked on file://. */
(() => {
  "use strict";

  const root = document.getElementById("tt");
  if (!root) return;

  const BODY = [
    [0, "000-front"], [22.5, "023-front-right"], [45, "045-front-right"], [67.5, "068-near-right"],
    [90, "090-right"], [112.5, "113-right-rear"], [135, "135-right-rear"], [180, "180-back"],
    [225, "225-back-left"], [247.5, "248-near-left"], [270, "270-left"], [315, "315-front-left"], [337.5, "338-near-front-left"],
  ].map(([a, f]) => ({ a, src: `/assets/turntable/body/${f}.webp` }));
  const HEAD = [
    [0, "000-front"], [22.5, "023-front-right"], [45, "045-front-right"], [67.5, "068-near-right"], [90, "090-right"],
    [112.5, "113-right-rear"], [157.5, "158-near-back-right"], [180, "180-back"], [202.5, "203-near-back-left"],
    [247.5, "248-left-rear"], [270, "270-left"], [292.5, "293-near-left"], [315, "315-front-left"], [337.5, "338-near-front-left"],
  ].map(([a, f]) => ({ a, src: `/assets/turntable/head/${f}.webp` }));

  // Coarse labels used while splitting the silhouette.
  const L = { none: 0, head: 1, torso: 2, rightArm: 3, leftArm: 4, rightLeg: 5, leftLeg: 6, legs: 7 };
  // Fine regions: what the veteran actually clicks. Index = value in the label map.
  const ARM = ["Shoulder", "UpperArm", "Elbow", "Forearm", "Wrist", "Hand"];
  const LEG = ["Hip", "Thigh", "Knee", "LowerLeg", "Ankle", "Foot"];
  const WORDS = { Shoulder: "shoulder", UpperArm: "upper arm", Elbow: "elbow", Forearm: "forearm", Wrist: "wrist", Hand: "hand", Hip: "hip", Thigh: "thigh", Knee: "knee", LowerLeg: "lower leg", Ankle: "ankle", Foot: "foot" };
  const CORE = ["head", "neck", "chest", "abdomen", "upperBack", "lowerBack"];
  const REGIONS = ["", ...CORE, ...["right", "left"].flatMap(s => [...ARM, ...LEG].map(p => s + p))];
  const R = Object.fromEntries(REGIONS.map((id, i) => [id, i]));
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

  // Conditions that aren't a body part. head: shown on the head turntable; regions: lit on the body.
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
  const HEAD_CONDS = new Set(Object.keys(CONDS).filter(k => CONDS[k].head));
  const money = v => v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const money0 = v => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const el = {
    img: document.getElementById("ttImg"),
    paint: document.getElementById("ttPaint"),
    tag: root.querySelector(".tt__tag"),
    tagLabel: document.getElementById("ttTagLabel"),
    view: document.getElementById("ttView"),
    angle: document.getElementById("ttAngle"),
    back: document.getElementById("ttBack"),
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
  const pctx = el.paint.getContext("2d");

  const state = {
    mode: "body",
    angle: 0,
    active: { type: "part", id: "leftKnee" },
    hover: null,
    effect: "Limited motion",
    rating: 70,
    conds: [],
    household: { spouse: false, aid: false, kids: 0, school: 0, parents: 0 },
    householdTouched: false,
    drag: null,
  };

  // ---------------------------------------------------------------- frames + segmentation
  const cache = new Map(); // src -> { img, seg }
  const SW = 400; // analysis width (half of the 800px frames)

  const norm = a => ((a % 360) + 360) % 360;
  const dist = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const frames = () => (state.mode === "body" ? BODY : HEAD);
  const nearest = (list, a) => list.reduce((best, f) => (dist(f.a, a) < dist(best.a, a) ? f : best), list[0]);

  function loadFrame(src) {
    let entry = cache.get(src);
    if (entry) return entry.ready;
    const img = new Image();
    img.decoding = "async";
    entry = { img, seg: null };
    entry.ready = new Promise(resolve => {
      img.onload = () => resolve(entry);
      img.onerror = () => resolve(entry);
    });
    img.src = src;
    cache.set(src, entry);
    return entry.ready;
  }

  function readAlpha(img) {
    const SH = Math.round(SW * img.naturalHeight / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = SW; c.height = SH;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0, SW, SH);
    const d = x.getImageData(0, 0, SW, SH).data; // throws on file://
    const on = new Uint8Array(SW * SH);
    for (let i = 0; i < on.length; i++) on[i] = d[i * 4 + 3] > 100 ? 1 : 0;
    const runs = new Array(SH);
    let top = -1, bot = -1;
    for (let y = 0; y < SH; y++) {
      const r = [];
      let s = -1;
      for (let xx = 0; xx <= SW; xx++) {
        const v = xx < SW && on[y * SW + xx];
        if (v && s < 0) s = xx;
        else if (!v && s >= 0) { if (xx - s >= 2) r.push([s, xx - 1]); s = -1; }
      }
      runs[y] = r;
      if (r.length) { if (top < 0) top = y; bot = y; }
    }
    return { on, runs, top, bot, SH };
  }

  // Splits a body frame into head / torso / arms / legs from its silhouette.
  function segmentBody(a, angle) {
    const { runs, top, bot, SH } = a;
    const FH = bot - top + 1, AX = SW / 2;
    const lab = new Uint8Array(SW * SH);
    const rowW = y => runs[y].reduce((t, r) => t + r[1] - r[0] + 1, 0);
    const rowMid = y => { const r = runs[y]; return r.length ? (r[0][0] + r[r.length - 1][1]) / 2 : AX; };

    const rad = angle * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const profile = Math.abs(cos) < 0.42;
    // Viewer-left limb is the model's right when the model faces us.
    const vl = cos >= 0 ? "right" : "left", vr = vl === "right" ? "left" : "right";
    const near = sin >= 0 ? "right" : "left";

    // Neck: narrowest row near the top.
    let neck = top + Math.round(0.15 * FH), best = 1e9;
    for (let y = Math.round(top + 0.08 * FH); y < top + 0.2 * FH; y++) { const w = rowW(y); if (w && w < best) { best = w; neck = y; } }
    const shoulder = neck + Math.round(0.03 * FH);

    // Crotch: first row where a central gap opens between two leg-width runs and stays open.
    const legGap = (y, ref) => {
      const r = runs[y]; if (!r) return null;
      let bestG = null;
      for (let i = 0; i < r.length - 1; i++) {
        const gc = (r[i][1] + r[i + 1][0]) / 2;
        if (Math.abs(gc - ref) < 0.07 * FH && r[i][1] - r[i][0] > 0.03 * FH && r[i + 1][1] - r[i + 1][0] > 0.03 * FH) {
          if (bestG === null || Math.abs(gc - ref) < Math.abs(bestG - ref)) bestG = gc;
        }
      }
      return bestG;
    };
    let crotch = -1, split = AX;
    if (!profile) {
      for (let y = Math.round(top + 0.45 * FH); y < top + 0.7 * FH; y++) {
        const g = legGap(y, AX); if (g === null) continue;
        let ok = true; for (let k = 1; k <= 6; k++) if (legGap(y + k, AX) === null) { ok = false; break; }
        if (ok) { crotch = y; split = g; break; }
      }
    }
    const legsSplit = crotch > 0;
    if (!legsSplit) crotch = Math.round(top + 0.565 * FH);
    const legCut = crotch - Math.round(0.02 * FH);

    const splitAt = new Float32Array(SH).fill(split);
    if (legsSplit) {
      let ref = split;
      for (let y = crotch; y <= bot; y++) { const g = legGap(y, ref); if (g !== null) ref = g; splitAt[y] = ref; }
    }

    for (let y = top; y <= bot; y++) {
      for (const [s, e] of runs[y]) {
        for (let x = s; x <= e; x++) {
          let v;
          if (y <= neck) v = L.head;
          else if (y >= legCut) v = legsSplit ? (x < splitAt[y] ? L[vl + "Leg"] : L[vr + "Leg"]) : L.legs;
          else v = L.torso;
          lab[y * SW + x] = v;
        }
      }
    }

    // Arms: find the armpit where an outer run separates from the torso.
    const armSep = (y, side) => {
      const r = runs[y]; if (!r || r.length < 2) return null;
      const o = side < 0 ? r[0] : r[r.length - 1], n = side < 0 ? r[1] : r[r.length - 2];
      if (o[1] - o[0] + 1 > 0.1 * FH) return null;
      if (side < 0 ? o[1] >= AX - 0.04 * FH : o[0] <= AX + 0.04 * FH) return null;
      return side < 0 ? (o[1] + n[0]) / 2 : (n[1] + o[0]) / 2;
    };
    const findArm = side => {
      for (let y = shoulder + Math.round(0.06 * FH); y < top + 0.5 * FH; y++) {
        const s = armSep(y, side); if (s === null) continue;
        let ok = true; for (let k = 1; k <= 8; k++) if (armSep(y + k, side) === null) { ok = false; break; }
        if (ok) return { y, inner: s };
      }
      return null;
    };
    const paintArm = (arm, side, v) => {
      const xTop = arm.inner + (AX - arm.inner) * 0.12;
      for (let y = shoulder; y < arm.y; y++) {
        const t = (y - shoulder) / Math.max(1, arm.y - shoulder);
        const cut = xTop + (arm.inner - xTop) * t;
        for (const [s, e] of runs[y]) for (let x = s; x <= e; x++) if (side < 0 ? x < cut : x > cut) lab[y * SW + x] = v;
      }
      let miss = 0;
      for (let y = arm.y; y <= bot && y < crotch + 0.13 * FH && miss < 10; y++) {
        let hit = false;
        for (const [s, e] of runs[y]) {
          if (side < 0 ? e <= arm.inner + 2 : s >= arm.inner - 2) { hit = true; for (let x = s; x <= e; x++) lab[y * SW + x] = v; }
        }
        miss = hit ? 0 : miss + 1;
      }
    };
    // Fallback when an arm overlaps the body: a band hanging from the shoulder.
    const bandArm = (where, v) => {
      const w = 0.045 * FH;
      for (let y = shoulder + Math.round(0.015 * FH); y < top + 0.55 * FH; y++) {
        const r = runs[y]; if (!r.length) continue;
        let c;
        if (where === "mid") c = rowMid(y) + 0.01 * FH;
        else if (where < 0) c = r[0][0] + w;
        else c = r[r.length - 1][1] - w;
        for (const [s, e] of r) for (let x = Math.max(s, Math.round(c - w)); x <= Math.min(e, Math.round(c + w)); x++) lab[y * SW + x] = v;
      }
    };

    if (profile) {
      bandArm("mid", L[near + "Arm"]);
    } else {
      const left = findArm(-1), right = findArm(1);
      if (left) paintArm(left, -1, L[vl + "Arm"]); else bandArm(-1, L[vl + "Arm"]);
      if (right) paintArm(right, 1, L[vr + "Arm"]); else bandArm(1, L[vr + "Arm"]);
    }
    // Head stays on top of anything above the neck.
    for (let y = top; y <= neck; y++) for (const [s, e] of runs[y]) for (let x = s; x <= e; x++) lab[y * SW + x] = L.head;

    // ---- fine regions, from body proportions measured along each limb
    const armEnd = { [L.rightArm]: shoulder, [L.leftArm]: shoulder };
    for (let y = shoulder; y <= bot; y++) for (const [s, e] of runs[y]) for (let x = s; x <= e; x++) {
      const v = lab[y * SW + x]; if (v === L.rightArm || v === L.leftArm) armEnd[v] = y;
    }
    // Which way the body faces in a profile view: the toes point forward.
    const centroid = (y0, y1) => { let sx = 0, n = 0; for (let y = y0; y <= y1; y++) for (const [s, e] of runs[y]) { sx += (s + e) / 2 * (e - s + 1); n += e - s + 1; } return n ? sx / n : AX; };
    const toes = Math.sign(centroid(bot - Math.round(0.012 * FH), bot) - centroid(bot - Math.round(0.07 * FH), bot - Math.round(0.05 * FH))) || (sin >= 0 ? -1 : 1);
    const facing = profile ? 0 : cos > 0 ? 1 : -1; // 1 front, -1 back, 0 profile
    const neckMid = rowMid(neck), neckHalf = rowW(neck) * 0.6;
    const chin = neck - Math.round(0.014 * FH), neckBot = shoulder + Math.round(0.012 * FH);
    const hipTop = crotch - Math.round(0.055 * FH), waist = shoulder + Math.round(0.48 * (hipTop - shoulder));
    const legLen = Math.max(1, bot - crotch);
    const sideAt = (x, y) => (profile ? near : x < (y >= legCut ? splitAt[y] : neckMid) ? vl : vr);
    const armPart = t => (t < 0.24 ? "Shoulder" : t < 0.4 ? "UpperArm" : t < 0.5 ? "Elbow" : t < 0.73 ? "Forearm" : t < 0.8 ? "Wrist" : "Hand");
    const legPart = t => (t < 0.06 ? "Hip" : t < 0.4 ? "Thigh" : t < 0.52 ? "Knee" : t < 0.86 ? "LowerLeg" : t < 0.93 ? "Ankle" : "Foot");

    const fine = new Uint8Array(SW * SH);
    for (let y = top; y <= bot; y++) {
      for (const [s, e] of runs[y]) {
        for (let x = s; x <= e; x++) {
          const i = y * SW + x, v = lab[i];
          let id;
          if (v === L.rightArm || v === L.leftArm) {
            const side = v === L.rightArm ? "right" : "left";
            id = side + armPart((y - shoulder) / Math.max(1, armEnd[v] - shoulder));
          } else if (v >= L.rightLeg) {
            const side = v === L.rightLeg ? "right" : v === L.leftLeg ? "left" : near;
            id = side + legPart((y - crotch) / legLen);
          } else if (y < chin) {
            id = "head";
          } else if (y <= neckBot) {
            id = Math.abs(x - neckMid) <= neckHalf ? "neck" : sideAt(x, y) + "Shoulder";
          } else if (y >= hipTop) {
            id = sideAt(x, y) + "Hip";
          } else {
            const front = facing ? facing > 0 : (x - rowMid(y)) * toes > 0;
            id = front ? (y < waist ? "chest" : "abdomen") : (y < waist ? "upperBack" : "lowerBack");
          }
          fine[i] = R[id];
        }
      }
    }
    return { lab: fine, SH, near };
  }

  // Head-view cues for conditions that are not tied to a limb.
  function segmentHead(a, angle, cond) {
    const { on, top, SH } = a;
    const lab = new Uint8Array(SW * SH);
    const zone = CONDS[cond]?.head;
    if (!zone) return { lab, SH };
    const rad = angle * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const HH = SH * 0.6 - top; // crown to chin
    const ears = [];
    const ex = (s) => 0.5 * SW + s * (0.29 * cos + 0.08 * sin) * SW; // s = -1 right ear, +1 left ear
    if (sin > -0.6) ears.push(ex(-1));
    if (sin < 0.6) ears.push(ex(1));
    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        if (!on[y * SW + x]) continue;
        const ry = (y - top) / HH;
        let hit = false;
        if (zone === "brain") hit = ry < 0.5;
        else if (zone === "forehead") hit = ry > 0.18 && ry < 0.5;
        else if (zone === "ears") hit = ears.some(cx => ((x - cx) / (0.075 * SW)) ** 2 + ((y - (top + 0.66 * HH)) / (0.1 * SH)) ** 2 < 1);
        if (hit) lab[y * SW + x] = 1;
      }
    }
    return { lab, SH };
  }

  // ---------------------------------------------------------------- painting
  const scratch = document.createElement("canvas");
  const sctx = scratch.getContext("2d");
  let segOK = true;

  // Regions a selection lights up on the body: a part, or the body area of a condition (asthma → chest).
  const regionsOf = sel => (!sel ? [] : sel.type === "part" ? [sel.id] : CONDS[sel.id]?.regions || []);

  function currentEntry() { return cache.get(nearest(frames(), state.angle).src); }

  function ensureSeg(entry, frame) {
    const key = state.mode === "head" ? `head:${state.active?.id}` : "body";
    if (entry.seg && entry.segKey === key) return entry.seg;
    if (!entry.alpha) entry.alpha = readAlpha(entry.img);
    entry.seg = state.mode === "head" ? segmentHead(entry.alpha, frame.a, state.active?.id) : segmentBody(entry.alpha, frame.a);
    entry.segKey = key;
    return entry.seg;
  }

  function render() {
    const frame = nearest(frames(), state.angle);
    const entry = cache.get(frame.src);
    if (!entry || !entry.img.complete || !entry.img.naturalWidth) return;
    if (el.img.getAttribute("src") !== frame.src) el.img.src = frame.src;
    el.img.alt = `Veteran model, ${viewName(state.angle).toLowerCase()} view`;
    el.view.textContent = viewName(state.angle);
    el.angle.textContent = `${Math.round(state.angle)}°`;

    const W = entry.img.naturalWidth, H = entry.img.naturalHeight;
    if (el.paint.width !== W || el.paint.height !== H) { el.paint.width = W; el.paint.height = H; }
    pctx.clearRect(0, 0, W, H);
    if (!segOK) return updateMark(null);

    let seg;
    try { seg = ensureSeg(entry, frame); } catch (e) { segOK = false; console.warn("Part highlighting needs the page served over http(s).", e); return updateMark(null); }
    const { lab, SH } = seg;

    const act = state.active;
    const actHead = state.mode === "head";
    const actSet = new Set(regionsOf(act).map(id => R[id]));
    const added = new Set(state.conds.filter(c => !HEAD_CONDS.has(c.id)).flatMap(c => regionsOf(c)).map(id => R[id]));
    const hov = state.hover ? R[state.hover] : 0;

    if (scratch.width !== SW || scratch.height !== SH) { scratch.width = SW; scratch.height = SH; }
    const out = sctx.createImageData(SW, SH);
    const px = out.data;
    let minX = SW, minY = SH, maxX = -1, maxY = -1, sx = 0, sy = 0, n = 0;
    const isAct = v => (actHead ? v === 1 : actSet.has(v));
    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const i = y * SW + x, v = lab[i];
        if (!v) continue;
        let r = 0, g = 0, b = 0, a = 0;
        if (isAct(v)) {
          const edge = !isAct(lab[i - 1]) || !isAct(lab[i + 1]) || !isAct(lab[i - SW]) || !isAct(lab[i + SW]);
          if (edge) { r = 255; g = 255; b = 255; a = 230; } else { r = 191; g = 10; b = 48; a = 150; }
          if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; sx += x; sy += y; n++;
        } else if (!actHead && added.has(v)) {
          const edge = lab[i - 1] !== v || lab[i + 1] !== v || lab[i - SW] !== v || lab[i + SW] !== v;
          r = 191; g = 10; b = 48; a = edge ? 150 : 80;
        } else if (!actHead && v === hov) {
          const edge = lab[i - 1] !== v || lab[i + 1] !== v || lab[i - SW] !== v || lab[i + SW] !== v;
          r = 255; g = 255; b = 255; a = edge ? 170 : 60;
        }
        const o = i * 4; px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = a;
      }
    }
    sctx.putImageData(out, 0, 0);
    pctx.imageSmoothingEnabled = true;
    pctx.drawImage(scratch, 0, 0, W, H);
    pctx.globalCompositeOperation = "destination-in";
    pctx.drawImage(entry.img, 0, 0, W, H); // clip the overlay to the exact silhouette
    pctx.globalCompositeOperation = "source-over";

    updateMark(n > 40 ? { minX: minX / SW, maxX: maxX / SW, minY: minY / SH, maxY: maxY / SH, cx: sx / n / SW, cy: sy / n / SH } : null);
  }

  // Brackets, crosshair and the "Marked" tag follow the selected region.
  function updateMark(box) {
    const act = state.active;
    const name = !act ? "—" : act.type === "part" ? PART_NAMES[act.id] : COND_NAMES[act.id];
    const imgTop = state.mode === "head" ? 0.06 : 0, imgH = state.mode === "head" ? 1000 / 1424 : 1;
    root.classList.toggle("has-mark", !!act);
    if (!act) return;
    if (!box) {
      el.tagLabel.textContent = state.mode === "body" && regionsOf(act).length ? `${name} · turn to see` : name;
      root.style.setProperty("--bw", "0px");
      root.style.setProperty("--cx", "-999%");
      root.style.setProperty("--cy", "-999%");
      setTag(0.62, 0.08, false);
      return;
    }
    el.tagLabel.textContent = name;
    const pad = 0.025;
    const bx = box.minX - pad, by = imgTop + (box.minY - pad) * imgH, bw = box.maxX - box.minX + pad * 2, bh = (box.maxY - box.minY + pad * 2) * imgH;
    root.style.setProperty("--bx", `${bx * 100}%`);
    root.style.setProperty("--by", `${by * 100}%`);
    root.style.setProperty("--bw", `${bw * 100}%`);
    root.style.setProperty("--bh", `${bh * 100}%`);
    root.style.setProperty("--cx", `${box.cx * 100}%`);
    root.style.setProperty("--cy", `${(imgTop + box.cy * imgH) * 100}%`);
    const right = bx + bw;
    if (right < 0.74) setTag(right + 0.02, by, false); else setTag(bx - 0.02, by, true);
  }
  function setTag(x, y, left) {
    const width = root.clientWidth;
    const tagWidth = el.tag.offsetWidth;
    const tagLeft = Math.min(Math.max(0, x * width - (left ? tagWidth : 0)), Math.max(0, width - tagWidth));
    const tagX = tagLeft + (left ? tagWidth : 0);
    root.style.setProperty("--tx", `${tagX / width * 100}%`);
    root.style.setProperty("--ty", `${Math.max(0, y) * 100}%`);
    el.tag.classList.toggle("is-left", left);
  }

  function viewName(a) {
    const c = [[0, "Front"], [90, "Right side"], [180, "Back"], [270, "Left side"], [360, "Front"]];
    const n = c.reduce((b, x) => (Math.abs(x[0] - a) < Math.abs(b[0] - a) ? x : b));
    if (Math.abs(n[0] - a) <= 12) return n[1];
    return a < 90 ? "Front right" : a < 180 ? "Back right" : a < 270 ? "Back left" : "Front left";
  }

  // ---------------------------------------------------------------- interaction
  function setAngle(a) {
    state.angle = norm(a);
    const f = nearest(frames(), state.angle);
    loadFrame(f.src).then(() => render());
  }

  function hitTest(ev) {
    const entry = currentEntry();
    if (!entry || !entry.seg || state.mode !== "body") return null;
    const r = el.img.getBoundingClientRect();
    const x = Math.floor((ev.clientX - r.left) / r.width * SW);
    const y = Math.floor((ev.clientY - r.top) / r.height * entry.seg.SH);
    if (x < 0 || y < 0 || x >= SW || y >= entry.seg.SH) return null;
    const v = entry.seg.lab[y * SW + x];
    return REGIONS[v] || null;
  }

  root.addEventListener("pointerdown", ev => {
    if (ev.button !== undefined && ev.button !== 0) return;
    state.drag = { x: ev.clientX, a: state.angle, moved: false, id: ev.pointerId };
  });
  root.addEventListener("pointermove", ev => {
    const d = state.drag;
    if (d) {
      const dx = ev.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 6) { d.moved = true; root.classList.add("is-dragging"); root.setPointerCapture?.(d.id); }
      if (d.moved) { setAngle(d.a - dx * 0.45); return; }
    }
    if (ev.pointerType === "mouse") {
      const part = hitTest(ev);
      root.classList.toggle("is-hovering", !!part);
      if (part !== state.hover) { state.hover = part; render(); }
    }
  });
  const endDrag = ev => {
    const d = state.drag; state.drag = null;
    root.classList.remove("is-dragging");
    if (!d) return;
    try { root.releasePointerCapture?.(d.id); } catch (_) { /* not captured */ }
    if (!d.moved && ev.type === "pointerup") {
      const part = hitTest(ev);
      if (part) select({ type: "part", id: part });
    }
  };
  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);
  root.addEventListener("pointerleave", () => { if (state.hover) { state.hover = null; root.classList.remove("is-hovering"); render(); } });
  // Keyboard: left/right turn the model, up/down step through the parts in view (head to feet).
  root.addEventListener("keydown", ev => {
    if (ev.key === "ArrowLeft") { ev.preventDefault(); setAngle(state.angle - 22.5); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); setAngle(state.angle + 22.5); }
    else if (ev.key === "Home") { ev.preventDefault(); setAngle(0); }
    else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (state.mode !== "body") return select({ type: "part", id: lastPart });
      const seen = visibleParts();
      if (!seen.length) return;
      const at = seen.indexOf(state.active?.type === "part" ? state.active.id : "");
      const next = seen[(at + (ev.key === "ArrowDown" ? 1 : seen.length - 1) + (at < 0 && ev.key === "ArrowUp" ? 1 : 0)) % seen.length];
      select({ type: "part", id: next });
      el.live.textContent = PART_NAMES[next];
    }
  });
  function visibleParts() {
    const seg = currentEntry()?.seg;
    if (!seg || state.mode !== "body") return [];
    if (!seg.present) { const s = new Set(seg.lab); seg.present = ORDER.filter(id => s.has(R[id])); }
    return seg.present;
  }
  document.querySelectorAll("[data-turn]").forEach(b => b.addEventListener("click", () => setAngle(state.angle + Number(b.dataset.turn) * 22.5)));

  let lastPart = state.active.id;
  function select(sel) {
    state.active = sel;
    if (sel.type === "part") lastPart = sel.id;
    const mode = sel.type === "cond" && HEAD_CONDS.has(sel.id) ? "head" : "body";
    if (mode !== state.mode) {
      state.mode = mode;
      root.dataset.mode = mode;
      if (mode === "head") HEAD.forEach(f => loadFrame(f.src));
    }
    el.back.hidden = mode !== "head";
    cache.forEach(e => { if (e.segKey && e.segKey !== "body") e.seg = null; });
    syncPicks();
    applyLevels();
    setAngle(state.angle);
  }
  // Head view → back to the full body, on the last part that was marked.
  el.back.addEventListener("click", () => { select({ type: "part", id: lastPart }); root.focus(); });

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
    const need = receipt.getBoundingClientRect().bottom - top + 64;
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

  // ---------------------------------------------------------------- start
  syncPicks();
  renderEstimate();
  loadFrame(BODY[0].src).then(render);
  const warm = () => BODY.forEach(f => loadFrame(f.src));
  if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 1200);
  window.addEventListener("resize", () => { render(); fitStage(); }, { passive: true });

  // Segmentation of any body frame, for tuning: returns { lab, SH, width } with region ids (index into REGIONS).
  async function segmentationOf(index) {
    const f = BODY[index]; const entry = await loadFrame(f.src);
    if (!entry.alpha) entry.alpha = readAlpha(entry.img);
    return { ...segmentBody(entry.alpha, f.a), width: SW, angle: f.a };
  }

  window.vacCalculator = {
    setAngle, select, segmentationOf, regions: REGIONS, estimate,
    getState: () => JSON.parse(JSON.stringify({ ...state, drag: null })),
  };
})();
