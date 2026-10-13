// 12 FOOTER
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="sec sec--footer">
      <div className="footer">
        <div className="footer__id">
          <Image src="/assets/img/logo.png" style={{ aspectRatio: "409 / 138" }} width={409} height={138} alt="Veterans Advocate Center" sizes="(max-width: 860px) 190px, 237px" />
          <p className="body">VAC is not a law firm or a VA-accredited claims agent, and does not represent veterans before VA or the Board of Veterans' Appeals. Free help is available from accredited VSOs.</p>
        </div>
        <nav className="footer__cols" aria-label="Footer">
          <div><p className="mono">Explore</p><a className="mono-l" href="#top">Home</a><a className="mono-l" href="#about">About</a><a className="mono-l" href="#stories">Stories</a><a className="mono-l" href="#calculator">Calculator</a></div>
          <div><p className="mono">Help</p><a className="mono-l" href="#services">Services</a><a className="mono-l" href="#resources">Resources</a><a className="mono-l" href="#faq">FAQ</a><a className="mono-l" href="#contact">Contact</a></div>
          <div><p className="mono">Reach</p><a className="mono-l" href="tel:+18778222023">+1 877-822-2023</a><a className="mono-l" href="mailto:info@vac2023.com">info@vac2023.com</a><a className="mono-l" href="https://www.facebook.com/veteransadvocatecenter">Facebook</a></div>
        </nav>
         <p className="mono footer__legal">© {new Date().getFullYear()} VAC · <a href="/privacy-policy">Privacy policy</a> · <a href="/terms-conditions">Terms &amp; conditions</a></p>
      </div>
    </footer>
  );
}
