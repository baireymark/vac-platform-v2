// 01 HERO
import Image from "next/image";

export default function Hero() {
  return (
    <header className="sec sec--hero" id="top">
      <div className="stage" style={{ "--h": "1010" }}>
        <nav className="nav" aria-label="Main">
          <a className="nav__icon nav__call" href="tel:+18778222023" aria-label="Call +1 877-822-2023">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a className="nav__logo" href="#top"><Image src="/assets/img/logo.png" style={{ aspectRatio: "409 / 138" }} width={409} height={138} alt="Veterans Advocate Center, home" sizes="(max-width: 860px) 190px, 296px" loading="eager" /></a>
          <ul className="nav__links">
            <li><a href="#top" aria-current="page">Home</a></li>
            <li><a href="#about">About us</a></li>
            <li><a href="#stories">Stories</a></li>
            <li><a href="#resources">Resources</a></li>
            <li><a href="#services">Services</a></li>
            <li><a className="nav__cta" href="#evaluation">Free evaluation</a></li>
          </ul>
          <button className="nav__icon nav__menu" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2.5" /></svg>
          </button>
        </nav>
        <div className="hero__brackets" aria-hidden="true"></div>
        <p className="p mono hero__label" style={{ "--x": "96", "--y": "60" }}>VAC // 001 — Briefing</p>
        <p className="p r mono hero__label hero__label--r" style={{ "--xr": "96", "--y": "60" }}>For those who served</p>
        {/* LCP element: fetched early at high priority. Desktop width tracks the hero height (about 0.76 × viewport height).
            aspectRatio pins the source ratio: resized files round their height, which would shift the mobile layout. */}
        <Image className="p hero__portrait" style={{ "--x": "686", "--y": "190", aspectRatio: "1185 / 1327" }} src="/assets/img/portrait-hero.png" width={1185} height={1327} alt="Smiling U.S. Army veteran in uniform, arms crossed" sizes="(max-width: 860px) 380px, 76vh" loading="eager" fetchPriority="high" />
        <div className="p hero__copy" style={{ "--x": "96", "--y": "242" }}>
          <h1 className="st-xl hero__title">
            <span>You stood</span>
            <span>for <em className="c-blue">us</em>.</span>
            <span>Now we stand</span>
            <span>with <em className="c-red">you</em>.</span>
          </h1>
          <p className="lead hero__sub">Your service deserves more than a thank-you.</p>
          <div className="hero__ctas">
            <a className="btn btn--red" href="#evaluation">Start free evaluation →</a>
            <a className="btn btn--line" href="tel:+18778222023">Talk to an advocate</a>
          </div>
        </div>
        <ul className="stats" aria-label="At a glance">
          <li><strong className="st-m">100%</strong><span className="mono">Success<br /> rate</span></li>
          <li className="stats__star" aria-hidden="true"><img src="/assets/svg/star-white.svg" width="18" height="18" alt="" /></li>
          <li><strong className="st-m">60</strong><span className="mono">Veteran owned<br /> &amp; operated</span></li>
          <li className="stats__star" aria-hidden="true"><img src="/assets/svg/star-white.svg" width="18" height="18" alt="" /></li>
          <li><strong className="st-m">1,000+</strong><span className="mono">Successful<br /> cases</span></li>
        </ul>
      </div>
    </header>
  );
}
