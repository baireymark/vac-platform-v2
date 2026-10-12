// 03 INTAKE
import SectionPhoto from "@/components/SectionPhoto.jsx";

export default function Intake() {
  return (
    <section className="sec sec--intake grid-bg" id="evaluation" aria-labelledby="intake-title">
      <SectionPhoto name="intake" src="/assets/img/overlay-apache.jpg" />
      <div className="intake">
        <p className="mono c-red intake__eyebrow">03 // Free evaluation</p>
        <h2 className="st-l" id="intake-title">Find out if you qualify<br /> for benefits.</h2>
        <p className="lead c-muted intake__sub">It only takes a few minutes to start your journey toward the benefits you’ve earned.</p>
        <div className="intake__wrap">
          <form className="card intake__card" id="intakeForm" noValidate>
            <input type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
            <ol className="stepper" aria-label="Evaluation progress">
              <li className="stepper__item is-on" data-for="1"><span className="stepper__box">1</span><span className="mono">Step 1</span></li>
              <li className="stepper__line" aria-hidden="true"></li>
              <li className="stepper__item" data-for="2"><span className="stepper__box">2</span><span className="mono">Step 2</span></li>
              <li className="stepper__line" aria-hidden="true"></li>
              <li className="stepper__item" data-for="3"><span className="stepper__box">3</span><span className="mono">Step 3</span></li>
            </ol>
            <div className="step" data-step="1">
              <fieldset className="q">
                <legend className="title">Have you ever applied for VA benefits?</legend>
                <div className="opts opts--2">
                  <label className="opt"><input type="radio" name="applied" value="yes" required /><span className="opt__dot"></span><span className="mono-l">Yes</span></label>
                  <label className="opt"><input type="radio" name="applied" value="no" /><span className="opt__dot"></span><span className="mono-l">No</span></label>
                </div>
              </fieldset>
              <fieldset className="q">
                <legend className="title">Have you been denied in the past?</legend>
                <div className="opts opts--2">
                  <label className="opt"><input type="radio" name="denied" value="yes" required /><span className="opt__dot"></span><span className="mono-l">Yes</span></label>
                  <label className="opt"><input type="radio" name="denied" value="no" /><span className="opt__dot"></span><span className="mono-l">No</span></label>
                </div>
              </fieldset>
            </div>
            <div className="step" data-step="2" hidden>
              <fieldset className="q">
                <legend className="title">Which branch did you serve in?</legend>
                <div className="opts opts--4">
                  <label className="opt"><input type="radio" name="branch" value="Army" required /><span className="opt__dot"></span><span className="mono-l">Army</span></label>
                  <label className="opt"><input type="radio" name="branch" value="Navy" /><span className="opt__dot"></span><span className="mono-l">Navy</span></label>
                  <label className="opt"><input type="radio" name="branch" value="Air Force" /><span className="opt__dot"></span><span className="mono-l">Air Force</span></label>
                  <label className="opt"><input type="radio" name="branch" value="Marine Corps" /><span className="opt__dot"></span><span className="mono-l">Marine Corps</span></label>
                  <label className="opt"><input type="radio" name="branch" value="Coast Guard" /><span className="opt__dot"></span><span className="mono-l">Coast Guard</span></label>
                  <label className="opt"><input type="radio" name="branch" value="Space Force" /><span className="opt__dot"></span><span className="mono-l">Space Force</span></label>
                  <label className="opt"><input type="radio" name="branch" value="None" /><span className="opt__dot"></span><span className="mono-l">None</span></label>
                </div>
              </fieldset>
              <fieldset className="q">
                <legend className="title">When did you serve?</legend>
                <div className="opts opts--3">
                  <label className="opt"><input type="radio" name="period" value="Pre-1990" required /><span className="opt__dot"></span><span className="mono-l">Pre-1990</span></label>
                  <label className="opt"><input type="radio" name="period" value="1990-2001" /><span className="opt__dot"></span><span className="mono-l">1990-2001</span></label>
                  <label className="opt"><input type="radio" name="period" value="Post-2001" /><span className="opt__dot"></span><span className="mono-l">Post-2001</span></label>
                </div>
              </fieldset>
            </div>
            <div className="step" data-step="3" hidden>
              <div className="field">
                <label className="mono" htmlFor="in-name">Name</label>
                <input className="input" id="in-name" name="name" type="text" autoComplete="name" placeholder="Name" required />
              </div>
              <fieldset className="q">
                <legend className="title">What is your current disability status?</legend>
                <div className="opts opts--3">
                  <label className="opt"><input type="radio" name="status" value="none" required /><span className="opt__dot"></span><span className="mono-l">No disability rating</span></label>
                  <label className="opt"><input type="radio" name="status" value="10-90" /><span className="opt__dot"></span><span className="mono-l">10%-90%</span></label>
                  <label className="opt"><input type="radio" name="status" value="100" /><span className="opt__dot"></span><span className="mono-l">100%</span></label>
                </div>
              </fieldset>
              <div className="field-row">
                <div className="field">
                  <label className="mono" htmlFor="in-email">Email</label>
                  <input className="input" id="in-email" name="email" type="email" autoComplete="email" spellCheck="false" placeholder="Email" required />
                </div>
                <div className="field">
                  <label className="mono" htmlFor="in-phone">Phone number</label>
                  <input className="input" id="in-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone number" required />
                </div>
              </div>
              <label className="consent"><input type="checkbox" name="terms" /><span className="consent__box"></span><span>I agree to the <a href="https://veteransadvocatecenter.com/terms-conditions/">Terms and Conditions</a> and <a href="https://veteransadvocatecenter.com/privacy-policy/">Privacy Policy</a> provided by Veterans Advocate Center. By providing my phone number, I consent to receive text messages and calls from Veterans Advocate Center.</span></label>
              <label className="consent"><input type="checkbox" name="sms" /><span className="consent__box"></span><span>By checking this box and submitting this form, you consent to receive SMS text messages from <b>Veterans Advocate Center</b> about benefits screening, claims updates, appointment reminders, intake support, and service announcements. Message frequency may vary. Message and data rates may apply. Reply <b>STOP</b> to opt out and <b>HELP</b> for assistance, or call <b>+1 877-822-2023</b>. See our <a href="https://veteransadvocatecenter.com/privacy-policy/">Privacy Policy</a> and <a href="https://veteransadvocatecenter.com/terms-conditions/">Terms</a>.</span></label>
            </div>
            <p className="form-error" role="alert" id="intakeError" hidden></p>
            <div className="intake__actions">
              <button className="btn btn--navy-line" type="button" id="intakeBack" hidden>← Back</button>
              <button className="btn btn--red" type="submit" id="intakeNext">Next →</button>
              <p className="mono c-muted intake__count" id="intakeCount">Step 1 of 3</p>
            </div>
            <div className="done" id="intakeDone" hidden tabIndex="-1">
              <p className="mono c-red">Received // Sent</p>
              <p className="title">Thanks. Your answers were sent.</p>
              <p className="body c-muted">An advocate will reach out soon. To talk now, call <a href="tel:+18778222023">+1 877-822-2023</a>.</p>
            </div>
          </form>
          <div className="stamp stamp--intake" aria-hidden="true">
            <span className="stamp__free">Free</span>
            <img src="/assets/svg/star-red.svg" width="22" height="22" alt="" />
            <span className="stamp__eval">Evaluation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
