// 02 CALCULATOR (3D)
export default function Calculator() {
  return (
    <section className="sec sec--calc" id="calculator" aria-labelledby="calc-title">
      <div className="stage" style={{ "--h": "1560" }}>
        <p className="p mono" style={{ "--x": "104", "--y": "72" }}>02 // VA disability calculator</p>
        <h2 className="p st-l" id="calc-title" style={{ "--x": "104", "--y": "104" }}>Mark the spot.</h2>
        <ol className="p r calc__progress" style={{ "--xr": "104", "--y": "150" }} aria-label="Calculator steps">
          <li className="is-on" aria-current="step">01 Body</li>
          <li>02 Conditions</li>
          <li>03 Household</li>
          <li>04 Estimate</li>
        </ol>
        <div className="p calc__viewer" style={{ "--x": "334", "--y": "230", "--w": "700" }}>
          <img className="calc__glow" src="/assets/svg/calc-glow.svg" alt="" aria-hidden="true" />
          <img className="calc__floor" src="/assets/svg/calc-floor.svg" alt="" aria-hidden="true" />
<div className="tt tt--3d" id="tt" tabIndex="0" role="group" aria-label="3D veteran model. Drag or use left and right arrows to rotate. Click a part or choose a body part below.">
            <vac-body-map id="vacBody" model="/assets/calculator/model-male.js" area="none" marks="[]" spin="0"></vac-body-map>
          </div>
        </div>
        <div className="p calc__turn" style={{ "--x": "534", "--y": "1478", "--w": "300" }}>
          <button className="turn__btn" type="button" data-turn="-1" aria-label="Turn left">‹</button>
          <p className="mono turn__read" aria-live="polite"><span id="ttView">Front</span> · <span id="ttAngle">0°</span></p>
          <button className="turn__btn" type="button" data-turn="1" aria-label="Turn right">›</button>
<div className="body-models" role="group" aria-label="Model">
            <button type="button" className="body-model mono" data-model-sex="male" aria-pressed="true">Male</button>
            <button type="button" className="body-model mono" data-model-sex="female" aria-pressed="false">Female</button>
          </div>
          <p className="mono turn__hint">Drag to turn · tap a part</p>
        </div>
        <div className="p calc__col calc__col--left" style={{ "--x": "104", "--y": "300" }}>
          <div className="pick" role="group" aria-labelledby="other-label">
            <p className="mono pick__label" id="other-label">Not on the body</p>
            <ul className="pick__list">
              <li><button className="pick__btn" type="button" data-cond="mentalHealth" aria-pressed="false"><span className="pick__box"></span>01 Mental health</button></li>
              <li><button className="pick__btn" type="button" data-cond="tinnitus" aria-pressed="false"><span className="pick__box"></span>02 Tinnitus</button></li>
              <li><button className="pick__btn" type="button" data-cond="hearing" aria-pressed="false"><span className="pick__box"></span>03 Hearing loss</button></li>
              <li><button className="pick__btn" type="button" data-cond="migraine" aria-pressed="false"><span className="pick__box"></span>04 Migraine</button></li>
              <li><button className="pick__btn" type="button" data-cond="tbi" aria-pressed="false"><span className="pick__box"></span>05 TBI</button></li>
              <li><button className="pick__btn" type="button" data-cond="sleep" aria-pressed="false"><span className="pick__box"></span>06 Sleep apnea</button></li>
              <li><button className="pick__btn" type="button" data-cond="breathing" aria-pressed="false"><span className="pick__box"></span>07 Asthma</button></li>
              <li><button className="pick__btn" type="button" data-cond="heart" aria-pressed="false"><span className="pick__box"></span>08 Heart / BP</button></li>
              <li><button className="pick__btn" type="button" data-cond="digestive" aria-pressed="false"><span className="pick__box"></span>09 GERD / digestive</button></li>
              <li><button className="pick__btn" type="button" data-cond="skin" aria-pressed="false"><span className="pick__box"></span>10 Skin / scars</button></li>
              <li><button className="pick__btn" type="button" data-cond="other" aria-pressed="false"><span className="pick__box"></span>11 Other</button></li>
            </ul>
          </div>
          <div className="pay-wrap">
            <div className="pay" id="pay" role="group" aria-labelledby="payLabel">
              <p className="mono pay__label"><span id="payLabel">Est. monthly pay</span><span className="pay__live"><i aria-hidden="true"></i>2026 rates</span></p>
              <p className="pay__amount" aria-hidden="true"><span className="pay__dollars" id="payDollars">$0</span><span className="pay__tail"><span className="pay__cents" id="payCents">.00</span><span className="mono pay__per">/ mo</span></span></p>
              <p className="sr-only" id="payText">$0.00 a month</p>
              <p className="mono pay__year" id="payYear">Add a condition to start</p>
              <div className="pay__bar" id="payBar" aria-hidden="true"></div>
              <div className="pay__row pay__row--base"><span className="house__name" id="payBaseLabel">No rating yet</span><span className="pay__add" id="payBase">—</span></div>
              <div className="house" role="group" aria-labelledby="house-label">
                <p className="mono pay__sub" id="house-label">Household <span className="house__note">· adds pay at 30%+</span></p>
                <div className="house__row"><span className="house__name">Spouse</span><button className="house__toggle" type="button" id="spouse" aria-pressed="false">[ Off ]</button><span className="pay__add" data-add="spouse">—</span></div>
                <div className="house__row" id="aaRow" hidden><span className="house__name">Spouse aid<small>needs daily help (A&amp;A)</small></span><button className="house__toggle" type="button" id="spouseAid" aria-pressed="false" aria-label="Spouse needs aid and attendance">[ Off ]</button><span className="pay__add" data-add="aid">—</span></div>
                <div className="house__row"><span className="house__name">Kids<small>under 18</small></span><span className="house__step"><button type="button" data-count="kids" data-step="-1" aria-label="Fewer children under 18">−</button><output id="kids" aria-live="polite">0</output><button type="button" data-count="kids" data-step="1" aria-label="More children under 18">+</button></span><span className="pay__add" data-add="kids">—</span></div>
                <div className="house__row"><span className="house__name">Kids<small>18–23, in school</small></span><span className="house__step"><button type="button" data-count="school" data-step="-1" aria-label="Fewer children 18 to 23 in school">−</button><output id="school" aria-live="polite">0</output><button type="button" data-count="school" data-step="1" aria-label="More children 18 to 23 in school">+</button></span><span className="pay__add" data-add="school">—</span></div>
                <div className="house__row"><span className="house__name">Parents<small>dependent</small></span><span className="house__step"><button type="button" data-count="parents" data-step="-1" aria-label="Fewer dependent parents">−</button><output id="parents" aria-live="polite">0</output><button type="button" data-count="parents" data-step="1" aria-label="More dependent parents">+</button></span><span className="pay__add" data-add="parents">—</span></div>
              </div>
              <details className="math" id="math">
                <summary className="mono">Show the math</summary>
                <ol className="math__steps" id="mathSteps"></ol>
                <p className="mono math__facts" id="mathFacts"></p>
                <p className="math__fine">VA combined ratings method (38 CFR 4.25–4.26). 2026 VA rates, effective Dec 1, 2025. Special monthly compensation (SMC) not included.</p>
              </details>
            </div>
          </div>
        </div>
        <div className="p calc__col calc__builder" style={{ "--x": "964", "--y": "300", "--w": "212" }}>
<div className="body-picker"><label className="mono" htmlFor="bodyPart">Body part</label><select id="bodyPart"><option value="">Choose a body part</option></select><p className="mono" id="bodySelection" aria-live="polite">Left knee</p></div>
          <div className="pick" role="group" aria-labelledby="effect-label">
            <p className="mono pick__label" id="effect-label">Effect</p>
            <div className="chips">
              <button className="chip" type="button" data-effect="Pain" aria-pressed="false">Pain</button>
              <button className="chip" type="button" data-effect="Limited motion" aria-pressed="true">Limited motion</button>
              <button className="chip" type="button" data-effect="Weakness" aria-pressed="false">Weakness</button>
              <button className="chip" type="button" data-effect="Gives way" aria-pressed="false">Gives way</button>
              <button className="chip" type="button" data-effect="Numbness" aria-pressed="false">Numbness</button>
              <button className="chip" type="button" data-effect="Replaced" aria-pressed="false">Replaced</button>
            </div>
          </div>
          <div className="sev">
            <p className="mono sev__label"><span id="sev-label">VA rating <span className="sev__max" id="sevMax"></span></span><span className="c-red" id="sevText">70%</span></p>
            <div className="sev__meter" role="radiogroup" aria-labelledby="sev-label" id="sevMeter"></div>
            <p className="mono sev__scale" aria-hidden="true"><span>10%</span><span>100%</span></p>
          </div>
          <button className="btn btn--red btn--block" type="button" id="addCond">+ Add condition</button>
          <div className="conds">
            <p className="mono" id="condsTitle">Your conditions (0)</p>
            <ul className="conds__list" id="condsList" aria-labelledby="condsTitle"></ul>
            <button className="mono conds__clear" type="button" id="clearConds" hidden>× Clear all</button>
            <p className="mono conds__empty" id="condsEmpty">Tap a part, set its rating, add it.</p>
          </div>
          <p className="sr-only" aria-live="polite" id="calcLive"></p>
        </div>
        <div className="p calc__tag" style={{ "--x": "868", "--y": "1040" }} role="status" aria-labelledby="estLabel">
          <img className="calc__chain" src="/assets/svg/ballchain-tag.svg" width="160" height="120" alt="" aria-hidden="true" />
          <div className="dogtag">
            <span className="dogtag__hole" aria-hidden="true"></span>
            <p className="mono" id="estLabel">Est. combined rating</p>
            <p className="dogtag__value" id="estRating">0%</p>
            <p className="mono" id="estExact">Add a condition</p>
          </div>
        </div>
        <a className="p r btn btn--red" style={{ "--xr": "104", "--y": "1420" }} href="#evaluation">Get free evaluation →</a>
        <p className="p r mono calc__note" style={{ "--xr": "104", "--y": "1490" }}>Estimate only. VA decides final ratings.</p>
      </div>
    </section>
  );
}
