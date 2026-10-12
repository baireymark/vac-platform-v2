// Mobile menu
import Image from "next/image";

export default function Menu() {
  return (
    <div className="menu" id="menu" hidden>
      <div className="menu__bar">
        <a className="nav__icon nav__call" href="tel:+18778222023" aria-label="Call +1 877-822-2023">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
        <Image src="/assets/img/logo.png" style={{ aspectRatio: "409 / 138" }} width={409} height={138} alt="Veterans Advocate Center" sizes="190px" loading="eager" />
        <button className="nav__icon nav__menu" type="button" id="menuClose" aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.5" /></svg>
        </button>
      </div>
      <nav aria-label="Mobile">
        <ol className="menu__links">
          <li><a href="#top" aria-current="page"><span className="mono">01</span><span className="menu__word">Home</span></a></li>
          <li><a href="#calculator"><span className="mono">02</span><span className="menu__word">Calculator</span></a></li>
          <li><a href="#stories"><span className="mono">03</span><span className="menu__word">Stories</span></a></li>
          <li><a href="#services"><span className="mono">04</span><span className="menu__word">Services</span></a></li>
          <li><a href="#resources"><span className="mono">05</span><span className="menu__word">Resources</span></a></li>
          <li><a href="#about"><span className="mono">06</span><span className="menu__word">About us</span></a></li>
        </ol>
      </nav>
      <a className="btn btn--red btn--block" href="#evaluation">Start free evaluation →</a>
      <a className="mono-l menu__phone" href="tel:+18778222023">+1 877-822-2023</a>
      <p className="mono menu__note">Not a law firm. Not VA-accredited.<br />Free help: accredited VSOs.</p>
    </div>
  );
}
