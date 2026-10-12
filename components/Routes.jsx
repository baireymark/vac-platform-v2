// 04 ROUTES
import SectionPhoto from "@/components/SectionPhoto.jsx";

export default function Routes() {
  return (
    <section className="sec sec--routes grid-bg" id="services" aria-labelledby="routes-title">
      <SectionPhoto name="routes" src="/assets/img/overlay-boots.jpg" sizes="100vw" />
      <div className="stage" style={{ "--h": "980" }}>
        <p className="p mono c-red" style={{ "--x": "104", "--y": "72" }}>04 // Where to start</p>
        <h2 className="p st-l" id="routes-title" style={{ "--x": "104", "--y": "104" }}>Pick your<br /> next move.</h2>
        <p className="p r routes__call" style={{ "--xr": "104", "--y": "120" }}><span className="mono c-muted">Not sure?</span> <a className="mono-l" href="tel:+18778222023">+1 877-822-2023</a></p>
        <ol className="routes">
          <li className="route-card" style={{ "--n-x": "74", "--n-y": "250", "--x": "93.4", "--y": "407.7", "--r": "3deg", "--t-x": "208.2", "--t-y": "385.2", "--t-r": "-1deg" }}>
            <span className="route-card__num" aria-hidden="true">01</span>
            <a className="pinned" href="#evaluation">
              <img src="/assets/img/route-evaluation.png" width="300" height="200" alt="" loading="lazy" />
              <span className="pinned__title"><span className="title">Free evaluation</span><span className="title c-red" aria-hidden="true">→</span></span>
              <span className="body c-muted">See which benefits may fit you.</span>
            </a>
            <span className="tape" aria-hidden="true"></span>
          </li>
          <li className="route-card" style={{ "--n-x": "458", "--n-y": "300", "--x": "494.8", "--y": "444.6", "--r": "-2deg", "--t-x": "593.2", "--t-y": "430.9", "--t-r": "-6deg" }}>
            <span className="route-card__num" aria-hidden="true">02</span>
            <a className="pinned" href="https://veteransadvocatecenter.com/services/">
              <img src="/assets/img/route-application.png" width="300" height="184" alt="" loading="lazy" />
              <span className="pinned__title"><span className="title">Application help</span><span className="title c-red" aria-hidden="true">→</span></span>
              <span className="body c-muted">Get ready to file with confidence.</span>
            </a>
            <span className="tape" aria-hidden="true"></span>
          </li>
          <li className="route-card" style={{ "--n-x": "842", "--n-y": "240", "--x": "866.8", "--y": "393.9", "--r": "1.5deg", "--t-x": "976.6", "--t-y": "373.9", "--t-r": "-2.5deg" }}>
            <span className="route-card__num" aria-hidden="true">03</span>
            <a className="pinned" href="https://veteransadvocatecenter.com/how-to-appeal-a-denied-claim/">
              <img src="/assets/img/route-denied.png" width="300" height="200" alt="" loading="lazy" />
              <span className="pinned__title"><span className="title">Denied before?</span><span className="title c-red" aria-hidden="true">→</span></span>
              <span className="body c-muted">See your options. Don't give up.</span>
            </a>
            <span className="tape" aria-hidden="true"></span>
          </li>
        </ol>
      </div>
    </section>
  );
}
