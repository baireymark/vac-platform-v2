// 09 FAQ
export default function Faq() {
  return (
    <section className="sec sec--faq" id="faq" aria-labelledby="faq-title">
      <div className="faq">
        <div className="faq__side">
          <p className="mono c-red">09 // FAQ</p>
          <h2 className="st-l" id="faq-title">Declass-<br />ified.</h2>
          <div className="reach">
            <p className="mono c-muted">Prefer to talk?</p>
            <a className="mono-l" href="tel:+18778222023">+1 877-822-2023</a>
            <a className="mono-l" href="mailto:info@vac2023.com">info@vac2023.com</a>
          </div>
          <p className="stamp-box" aria-hidden="true">Declassified</p>
        </div>
        <div className="faq__list">
          <details className="qa" open>
            <summary><span className="mono c-red">Q.01</span><span className="qa__q">Does VAC represent me before VA?</span><span className="qa__redact" aria-hidden="true"><i style={{ "--w": "180" }}></i><i style={{ "--w": "120" }}></i><i style={{ "--w": "80" }}></i><span className="mono c-red">Tap to declassify</span></span></summary>
            <p className="lead c-muted qa__a">No. VAC is not a law firm or VA-accredited agent. Free accredited help is available from VSOs.</p>
          </details>
          <details className="qa">
            <summary><span className="mono c-red">Q.02</span><span className="qa__q">Is the calculator an official VA decision?</span><span className="qa__redact" aria-hidden="true"><i style={{ "--w": "180" }}></i><i style={{ "--w": "120" }}></i><i style={{ "--w": "80" }}></i><span className="mono c-red">Tap to declassify</span></span></summary>
            <p className="lead c-muted qa__a">No. It is an estimate. VA assigns final ratings.</p>
          </details>
          <details className="qa">
            <summary><span className="mono c-red">Q.03</span><span className="qa__q">What should I ask about costs?</span><span className="qa__redact" aria-hidden="true"><i style={{ "--w": "140" }}></i><i style={{ "--w": "160" }}></i><i style={{ "--w": "60" }}></i><span className="mono c-red">Tap to declassify</span></span></summary>
            <p className="lead c-muted qa__a">Ask what is included, which services have fees, and what happens if you stop.</p>
          </details>
          <details className="qa">
            <summary><span className="mono c-red">Q.04</span><span className="qa__q">Can someone help me contact VAC?</span><span className="qa__redact" aria-hidden="true"><i style={{ "--w": "200" }}></i><i style={{ "--w": "90" }}></i><i style={{ "--w": "70" }}></i><span className="mono c-red">Tap to declassify</span></span></summary>
            <p className="lead c-muted qa__a">Yes. A spouse, caregiver or other helper can reach out with you.</p>
          </details>
          <details className="qa">
            <summary><span className="mono c-red">Q.05</span><span className="qa__q">What if I was denied before?</span><span className="qa__redact" aria-hidden="true"><i style={{ "--w": "120" }}></i><i style={{ "--w": "150" }}></i><i style={{ "--w": "100" }}></i><span className="mono c-red">Tap to declassify</span></span></summary>
            <p className="lead c-muted qa__a">Start with your decision letter, then look at your options.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
