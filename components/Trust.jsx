// 06 TRUST
import Image from "next/image";
import SectionPhoto from "@/components/SectionPhoto.jsx";

export default function Trust() {
  return (
    <section className="sec sec--trust" id="about" aria-labelledby="trust-title">
      <SectionPhoto name="trust" src="/assets/img/overlay-dogtags.jpg" sizes="100vw" />
      <div className="stage" style={{ "--h": "1040" }}>
        <p className="p mono c-red" style={{ "--x": "104", "--y": "72" }}>06 // Why veterans trust VAC</p>
        <h2 className="p st-l" id="trust-title" style={{ "--x": "104", "--y": "104" }}>Your service.<br /> Your decision.</h2>
        <figure className="p polaroid" style={{ "--x": "749.4", "--y": "52.4", "--r": "-3deg" }}>
          <Image src="/assets/img/trust-photo.png" width={784} height={588} alt="Three service members saluting, overlaid with the American flag" sizes="(max-width: 860px) 330px, 450px" />
          <figcaption className="mono">Turning disabilities into possibilities</figcaption>
        </figure>
        <span className="p tape tape--polaroid" style={{ "--x": "888.8", "--y": "55.8", "--r": "4deg" }} aria-hidden="true"></span>
        <svg className="trust__chain" id="trustChain" aria-hidden="true" focusable="false"></svg>
        <ul className="tags">
          <li className="p tag tag--navy" style={{ "--x": "93.9", "--y": "501", "--r": "5deg" }}><span className="tag__link"></span><span className="tag__plate"><span className="tag__hole"></span><span className="st-s">Unmatched<br />experience</span></span></li>
          <li className="p tag tag--red" style={{ "--x": "385.6", "--y": "502.65", "--r": "-3deg" }}><span className="tag__link"></span><span className="tag__plate"><span className="tag__hole"></span><span className="st-s">Veteran owned<br />&amp; operated</span></span></li>
          <li className="p tag tag--blue" style={{ "--x": "650.1", "--y": "515.9", "--r": "3deg" }}><span className="tag__link"></span><span className="tag__plate"><span className="tag__hole"></span><span className="st-s">One step<br />at a time</span></span></li>
          <li className="p tag tag--light" style={{ "--x": "939.4", "--y": "481.9", "--r": "-4deg" }}><span className="tag__link"></span><span className="tag__plate"><span className="tag__hole"></span><span className="st-s">You make<br />every decision</span></span></li>
        </ul>
        <div className="p note" style={{ "--x": "104.2", "--y": "776", "--r": "2deg" }}>
          <p className="mono c-red">Field note // Good to know</p>
          <ul>
            <li><img src="/assets/svg/box-x.svg" width="20" height="20" alt="No:" /> <span className="mono-l">Not a law firm</span></li>
            <li><img src="/assets/svg/box-x.svg" width="20" height="20" alt="No:" /> <span className="mono-l">Not VA-accredited</span></li>
            <li><img src="/assets/svg/box-check.svg" width="20" height="20" alt="Yes:" /> <span className="mono-l">Free help: accredited VSOs</span></li>
          </ul>
        </div>
        <span className="p tape" style={{ "--x": "240.7", "--y": "751.4", "--r": "-3deg" }} aria-hidden="true"></span>
        <div className="p stamp stamp--trust" style={{ "--x": "790.1", "--y": "783.3", "--r": "14deg" }} aria-hidden="true">
          <span className="stamp__free">Free</span>
          <img src="/assets/svg/star-red.svg" width="26" height="26" alt="" />
          <span className="stamp__eval">Evaluation</span>
        </div>
      </div>
    </section>
  );
}
