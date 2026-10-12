/* VA disability estimate: combined rating, bilateral factor and monthly pay.
   Ported unchanged from the VAC calculator embed (vac-calculator-embed, calculator.html): VA combined ratings
   method (38 CFR 4.25–4.26) and 2026 VA compensation rates. Special monthly compensation (SMC) is not included.
   Update RATES every December 1 (cost-of-living adjustment), and the "2026" wording in components/Calculator.jsx with it. */
(() => {
  "use strict";

  // 2026 VA rates (effective Dec 1, 2025).
  // a = veteran alone; s = spouse add; p = per parent; c = first child (no spouse); cs = first child (with spouse);
  // u = each additional child under 18; sc = each additional child 18–23 in school; aa = spouse Aid & Attendance
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

  // Highest rating first; each next rating applies only to what's left of the whole person, rounded at each step.
  function combine(values) {
    let combined = 0;
    const steps = [];
    values.slice().sort((a, b) => b - a).forEach((r, i) => {
      const remaining = 100 - combined;
      const next = Math.round(combined + remaining * r / 100);
      steps.push(i === 0 ? `Start with the highest, ${r}%. ${100 - r}% of you is left to rate.` : `${r}% of the ${remaining}% left → ${next}%`);
      combined = next;
    });
    return { value: combined, steps };
  }
  const an = n => (String(n).startsWith("8") ? "an" : "a");

  /**
   * ratings: [{ pct: 10..100, limb?: "upper" | "lower", side?: "L" | "R" }]
   * household: { spouse, aid, kids, school, parents }
   * Returns { rating, exact, naive, bilateral, factor, pay, steps, isBilateral(r) }.
   */
  function estimate(ratings, household = {}) {
    const hasSide = (limb, side) => ratings.some(r => r.limb === limb && r.side === side);
    const pair = { upper: hasSide("upper", "L") && hasSide("upper", "R"), lower: hasSide("lower", "L") && hasSide("lower", "R") };
    const isBilateral = r => !!r.limb && pair[r.limb];

    const bi = ratings.filter(isBilateral).map(r => r.pct);
    const values = ratings.filter(r => !isBilateral(r)).map(r => r.pct);
    let steps = [], factor = 0;
    if (bi.length) {
      const b = combine(bi);
      factor = Math.round(b.value * 0.1 * 10) / 10;
      const withFactor = Math.round(b.value + factor);
      steps.push(`Both sides (${bi.join("%, ")}%) combine to ${b.value}%, plus a ${factor} bilateral factor → ${withFactor}%`);
      values.push(withFactor);
    }
    const c = combine(values);
    steps = steps.concat(c.steps);
    const exact = Math.min(100, c.value);
    const rating = exact === 0 ? 0 : Math.min(100, Math.round(exact / 10) * 10);
    if (ratings.length) steps.push(`${exact}% rounds to ${an(rating)} ${rating}% VA rating`);

    // Pay, itemised so the page can show what each household member adds.
    const { spouse = false, aid = false, kids = 0, school = 0, parents = 0 } = household;
    const items = { base: 0, spouse: 0, aid: 0, kids: 0, school: 0, parents: 0 };
    const t = RATES[rating];
    if (t) {
      items.base = t.a;
      if (rating >= 30) {
        if (spouse) { items.spouse = t.s; if (aid) items.aid = t.aa; }
        items.parents = parents * t.p;
        if (kids + school > 0) {
          const first = spouse ? t.cs : t.c;
          if (kids > 0) { items.kids = first + (kids - 1) * t.u; items.school = school * t.sc; }
          else items.school = first + (t.sc - t.u) + (school - 1) * t.sc;
        }
      }
    }
    Object.keys(items).forEach(k => { items[k] = Math.round(items[k] * 100) / 100; });
    const pay = Math.round(Object.values(items).reduce((s, v) => s + v, 0) * 100) / 100;

    return {
      rating, exact, pay, items, steps, factor, isBilateral,
      bilateral: bi.length > 0,
      naive: ratings.reduce((s, r) => s + r.pct, 0), // what adding them up would (wrongly) give
    };
  }

  // Ratings the VA can assign per body region / condition (38 CFR Part 4). Filled in below.
  const LEVELS = { parts: {}, conds: {} };

  window.VAMath = { RATES, LEVELS, combine, estimate };
})();
