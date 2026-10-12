// 05 STORIES
export default function Stories() {
  return (
    <section className="sec sec--stories" id="stories" aria-labelledby="stories-title">
      <div className="stage" style={{ "--h": "1010" }}>
        <p className="p reel-ghost" id="reelGhost" style={{ "--x": "40", "--y": "430" }} aria-hidden="true">Mike</p>
        <p className="p mono reel-kicker" style={{ "--x": "104", "--y": "72" }}>05 // Veteran stories · 5 tapes</p>
        <h2 className="p st-l reel-title" id="stories-title" style={{ "--x": "104", "--y": "104" }}>Real veterans.<br /> Real results.</h2>
        <div className="p r reel-cta" style={{ "--xr": "104", "--y": "104" }}>
          <a className="btn btn--white" href="https://veteransadvocatecenter.com/success-stories/">Watch all stories →</a>
          <p className="mono">Not paid endorsers.</p>
        </div>
        <div className="p reel-info" style={{ "--x": "104", "--y": "372", "--w": "340" }}>
          <p className="mono reel-info__now"><span className="reel-info__dot" aria-hidden="true"></span>Now showing · Tape <span id="reelNum">01</span> / 05</p>
          <h3 className="reel-info__name" id="reelName" aria-live="polite">Mike</h3>
          <p className="mono-l reel-info__meta" id="reelMeta" hidden></p>
          <p className="lead reel-info__line" id="reelLine">Turned down on his own. Then got his benefits.</p>
          <div className="reel-info__ctl">
            <button className="btn btn--red" type="button" id="reelPlay"><svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1v10l9-5z" fill="currentColor" /></svg>Play · <span id="reelDur">2:25</span></button>
            <button className="reel-sq" type="button" data-step="-1" aria-label="Previous story">‹</button>
            <button className="reel-sq" type="button" data-step="1" aria-label="Next story">›</button>
          </div>
        </div>
        <figure className="p vf" style={{ "--x": "476", "--y": "300", "--w": "364" }}>
          <div className="vf__screen" id="vfScreen">
            <img className="vf__still" id="vfStill" src="/assets/img/story-mike.jpg" width="569" height="1024" alt="Mike, still from his video story" loading="lazy" />
            <video className="vf__video" id="vfVideo" playsInline preload="none" hidden></video>
            <div className="vf__hud" aria-hidden="true">
              <span className="vf__rec"><i></i><b id="vfState">STBY</b></span>
              <span className="vf__cam">CAM 01 <span className="vf__batt"></span></span>
              <span className="vf__cross"></span>
              <span className="vf__time" id="vfTime">00:00 / 02:25</span>
              <span className="vf__tape" id="vfTape">TAPE 01</span>
            </div>
            <button className="vf__play" type="button" id="vfPlay" aria-label="Play Mike's story, 2 minutes 25 seconds"><svg width="34" height="34" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1v10l8.5-5z" fill="currentColor" /></svg></button>
            <p className="vf__error mono" id="vfError" hidden>Signal lost. <a href="https://veteransadvocatecenter.com/success-stories/">Watch on the VAC site</a></p>
          </div>
        </figure>
        <ol className="p tapes" style={{ "--x": "880", "--y": "360", "--w": "296" }} aria-label="Choose a story">
          <li><button className="vhs" type="button" aria-pressed="true" data-name="Mike" data-still="/assets/img/story-mike.jpg" data-video="https://veteransadvocatecenter.com/wp-content/uploads/2025/01/VID-20250114-WA0002.mp4" data-dur="2:25" data-dur-long="2 minutes 25 seconds" data-line="Turned down on his own. Then got his benefits."><img className="vhs__thumb" src="/assets/img/story-mike.jpg" width="569" height="1024" alt="" loading="lazy" /><span className="vhs__label"><span className="vhs__num">01</span><span className="vhs__name">Mike</span></span><span className="vhs__dur mono">2:25</span></button></li>
          <li><button className="vhs" type="button" aria-pressed="false" data-name="Matthew" data-still="/assets/img/story-matthew.jpg" data-video="https://veteransadvocatecenter.com/wp-content/uploads/2025/01/VID-20250114-WA0003.mp4" data-dur="2:33" data-dur-long="2 minutes 33 seconds" data-line="Thought he didn't qualify. He did."><img className="vhs__thumb" src="/assets/img/story-matthew.jpg" width="569" height="1024" alt="" loading="lazy" /><span className="vhs__label"><span className="vhs__num">02</span><span className="vhs__name">Matthew</span></span><span className="vhs__dur mono">2:33</span></button></li>
          <li><button className="vhs" type="button" aria-pressed="false" data-name="Jason" data-still="/assets/img/story-jason.jpg" data-video="https://veteransadvocatecenter.com/wp-content/uploads/2025/01/VID-20250114-WA0004.mp4" data-dur="3:01" data-dur-long="3 minutes 1 second" data-line="From 40% on his own to 100%."><img className="vhs__thumb" src="/assets/img/story-jason.jpg" width="569" height="1024" alt="" loading="lazy" /><span className="vhs__label"><span className="vhs__num">03</span><span className="vhs__name">Jason</span></span><span className="vhs__dur mono">3:01</span></button></li>
          <li><button className="vhs" type="button" aria-pressed="false" data-name="Seth Bare" data-meta="20 years in Special Forces" data-still="/assets/img/story-seth.jpg" data-video="https://veteransadvocatecenter.com/wp-content/uploads/2025/04/WhatsApp-Video-2025-04-15-at-07.45.35_cbdb70ca.mp4" data-dur="1:00" data-dur-long="1 minute" data-line="His story, in his own words."><img className="vhs__thumb" src="/assets/img/story-seth.jpg" width="580" height="1024" alt="" loading="lazy" /><span className="vhs__label"><span className="vhs__num">04</span><span className="vhs__name">Seth</span></span><span className="vhs__dur mono">1:00</span></button></li>
          <li><button className="vhs" type="button" aria-pressed="false" data-name="Guy Delprete" data-meta="U.S. Navy, submarine force" data-still="/assets/img/story-guy.jpg" data-video="https://veteransadvocatecenter.com/wp-content/uploads/2025/04/WhatsApp-Video-2025-04-15-at-07.45.26_7b3f8166.mp4" data-dur="1:00" data-dur-long="1 minute" data-line="Told 30% was his limit. Now at 100%."><img className="vhs__thumb" src="/assets/img/story-guy.jpg" width="576" height="1024" alt="" loading="lazy" /><span className="vhs__label"><span className="vhs__num">05</span><span className="vhs__name">Guy</span></span><span className="vhs__dur mono">1:00</span></button></li>
        </ol>
      </div>
    </section>
  );
}
