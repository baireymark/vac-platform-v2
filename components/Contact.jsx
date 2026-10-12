// 11 CONTACT FORM
import SectionPhoto from "@/components/SectionPhoto.jsx";

export default function Contact() {
  return (
    <section className="sec sec--contact grid-bg grid-bg--paper" id="contact" aria-labelledby="contact-title">
      <SectionPhoto name="contact" src="/assets/img/overlay-osprey.jpg" />
      <div className="contact">
        <div className="contact__side">
          <p className="mono c-red">11 // Send a message</p>
          <h2 className="st-l contact__title" id="contact-title">You served<br /> your country.<br /> Now let VAC<br /> <span className="c-red">serve you.</span></h2>
          <p className="lead c-muted">Our team is committed to turning your disabilities into possibilities. Let us help you secure the benefits you’ve earned.</p>
          <div className="reach">
            <p className="mono c-muted">Prefer to talk?</p>
            <a className="mono-l" href="tel:+18778222023">+1 877-822-2023</a>
            <a className="mono-l" href="mailto:info@vac2023.com">info@vac2023.com</a>
          </div>
        </div>
        <form className="card contact__card" id="contactForm" noValidate>
          <input type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
          <p className="mono c-red">Dispatch // Contact form</p>
          <div className="field">
            <label className="mono" htmlFor="c-name">Name</label>
            <input className="input" id="c-name" name="name" type="text" autoComplete="name" placeholder="Name" required />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="mono" htmlFor="c-email">Email</label>
              <input className="input" id="c-email" name="email" type="email" autoComplete="email" spellCheck="false" placeholder="Email" required />
            </div>
            <div className="field">
              <label className="mono" htmlFor="c-phone">Phone</label>
              <input className="input" id="c-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone" />
            </div>
          </div>
          <label className="consent"><input type="checkbox" name="sms" /><span className="consent__box"></span><span>By checking this box and submitting this form, you consent to receive SMS text messages from <b>Veterans Advocate Center</b> about benefits screening, claims updates, appointment reminders, intake support, and service announcements. Message frequency may vary. Message and data rates may apply. Reply <b>STOP</b> to opt out and <b>HELP</b> for assistance, or call <b>+1 877-822-2023</b>. See our <a href="https://veteransadvocatecenter.com/privacy-policy/">Privacy Policy</a> and <a href="https://veteransadvocatecenter.com/terms-conditions/">Terms</a>.</span></label>
          <div className="field">
            <label className="mono" htmlFor="c-msg">Message</label>
            <textarea className="input input--area" id="c-msg" name="message" placeholder="Message" rows="5"></textarea>
          </div>
          <p className="form-error" role="alert" id="contactError" hidden></p>
          <button className="btn btn--red btn--block btn--tall" type="submit">Send →</button>
          <div className="done" id="contactDone" hidden tabIndex="-1">
            <p className="mono c-red">Received // Sent</p>
            <p className="title">Thanks. Your message was sent.</p>
            <p className="body c-muted">We’ll get back to you soon. To talk now, call <a href="tel:+18778222023">+1 877-822-2023</a>.</p>
          </div>
        </form>
      </div>
    </section>
  );
}
