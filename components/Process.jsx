// 07 ROUTE
export default function Process() {
  return (
    <section className="sec sec--route" id="process" aria-labelledby="route-title">
      <div className="stage" style={{ "--h": "860" }}>
        <img className="route__topo" src="/assets/svg/topo-wide.svg" width="3840" height="860" alt="" aria-hidden="true" loading="lazy" />
        <p className="p mono" style={{ "--x": "104", "--y": "72" }}>07 // You set the pace</p>
        <h2 className="p st-l" id="route-title" style={{ "--x": "104", "--y": "104" }}>The route.</h2>
        <a className="p r btn btn--red" style={{ "--xr": "104", "--y": "104" }} href="tel:+18778222023">Talk to an advocate →</a>
        <img className="p route__path" style={{ "--x": "40", "--y": "0", "--w": "1200" }} src="/assets/svg/route-path.svg" width="1200" height="860" alt="" aria-hidden="true" />
        <ol className="waypoints">
          <li className="wp" style={{ "--x": "155", "--y": "505", "--cx": "170", "--cy": "616" }}><span className="wp__halo" aria-hidden="true"></span><span className="wp__dot st-s" aria-hidden="true">01</span><div className="wp__card"><p className="mono c-red">WP-01</p><h3 className="title">Talk to us</h3><p className="body">Call, email or send a message.</p></div></li>
          <li className="wp" style={{ "--x": "505", "--y": "365", "--cx": "520", "--cy": "476" }}><span className="wp__halo" aria-hidden="true"></span><span className="wp__dot st-s" aria-hidden="true">02</span><div className="wp__card"><p className="mono c-red">WP-02</p><h3 className="title">Get a clear plan</h3><p className="body">Ask what's included and the cost.</p></div></li>
          <li className="wp" style={{ "--x": "845", "--y": "465", "--cx": "860", "--cy": "576" }}><span className="wp__halo" aria-hidden="true"></span><span className="wp__dot st-s" aria-hidden="true">03</span><div className="wp__card"><p className="mono c-red">WP-03</p><h3 className="title">You decide</h3><p className="body">No pressure. Move at your pace.</p></div></li>
        </ol>
        <p className="p route__dest" style={{ "--x": "953", "--y": "272" }}><span className="route__dest-text"><span className="mono">Destination</span><span className="mono-l">Your next step</span></span><span className="route__flag" aria-hidden="true"><img src="/assets/svg/star-red-28.svg" width="28" height="28" alt="" /></span></p>
      </div>
    </section>
  );
}
