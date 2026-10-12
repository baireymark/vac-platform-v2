// 08 GUIDES
import SectionPhoto from "@/components/SectionPhoto.jsx";

export default function Guides() {
  return (
    <section className="sec sec--guides" id="resources" aria-labelledby="guides-title">
      <SectionPhoto name="guides" src="/assets/img/overlay-marpat.jpg" sizes="(max-width: 860px) 100vw, 50vw" />
      <div className="stage" style={{ "--h": "780" }}>
        <p className="p mono c-red" style={{ "--x": "104", "--y": "72" }}>08 // Free guides</p>
        <h2 className="p st-l" id="guides-title" style={{ "--x": "104", "--y": "104" }}>Field manual.</h2>
        <a className="p r btn btn--navy-line" style={{ "--xr": "104", "--y": "104" }} href="https://veteransadvocatecenter.com/resources/">All resources →</a>
        <ul className="folders">
          <li className="p folder folder--navy" style={{ "--x": "104", "--y": "290" }}><a href="https://veteransadvocatecenter.com/how-to-appeal-a-denied-claim/"><span className="folder__sheet" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span className="folder__tab mono" aria-hidden="true">File 01</span><span className="folder__body"><span className="mono">Denied claims</span><span className="title">How to appeal a denied claim</span><span className="mono-l">Open file →</span></span></a></li>
          <li className="p folder folder--red" style={{ "--x": "472", "--y": "326" }}><a href="https://veteransadvocatecenter.com/common-mistakes-veterans-make-when-applying-for-benefits/"><span className="folder__sheet" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span className="folder__tab mono" aria-hidden="true">File 02</span><span className="folder__body"><span className="mono">Applying</span><span className="title">Common mistakes when applying</span><span className="mono-l">Open file →</span></span></a></li>
          <li className="p folder folder--blue" style={{ "--x": "840", "--y": "302" }}><a href="https://veteransadvocatecenter.com/tips-for-successfully-transitioning-from-military-to-civilian-life/"><span className="folder__sheet" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span className="folder__tab mono" aria-hidden="true">File 03</span><span className="folder__body"><span className="mono">Life after service</span><span className="title">From military to civilian life</span><span className="mono-l">Open file →</span></span></a></li>
        </ul>
      </div>
    </section>
  );
}
