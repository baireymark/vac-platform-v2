// 10 CALL IN
import Image from "next/image";

export default function CallIn() {
  return (
    <section className="sec sec--call" id="call" aria-labelledby="call-title">
      <div className="stage" style={{ "--h": "800" }}>
        <p className="p mono" style={{ "--x": "104", "--y": "72" }}>10 // Ready when you are</p>
        <h2 className="p st-l" id="call-title" style={{ "--x": "104", "--y": "104" }}>Ready when<br /> you are.</h2>
        <Image className="p call__portrait" style={{ "--x": "680", "--y": "90", "--w": "560" }} src="/assets/img/portrait-hero.png" width={1185} height={1327} alt="" sizes="(max-width: 860px) 340px, 580px" />
        <p className="p mono-l call__kicker" style={{ "--x": "108", "--y": "392" }}>+1 // Call</p>
        <a className="p call__number" style={{ "--x": "96", "--y": "430" }} href="tel:+18778222023" aria-label="Call +1 877-822-2023"><span className="call__shadow" aria-hidden="true">877<span className="hy">-</span><br />822<span className="hy">-</span><br />2023</span><span className="call__fill" aria-hidden="true">877<span className="hy">-</span><br />822<span className="hy">-</span><br />2023</span></a>
        <div className="p call__actions" style={{ "--x": "104", "--y": "664" }}>
          <a className="btn btn--white" href="#contact">Fill out the form to get started ↓</a>
          <a className="btn btn--navy" href="tel:+18778222023">Talk to a veteran advocate now</a>
        </div>
      </div>
    </section>
  );
}
