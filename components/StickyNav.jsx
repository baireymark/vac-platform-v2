"use client";

import { useEffect, useRef, useState } from "react";

const links = [["#top", "Home"], ["#services", "Services"], ["#stories", "Stories"], ["#about", "About us"], ["#resources", "Resources"]];

export default function StickyNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#top");
  const bar = useRef(null);
  const navigating = useRef(false);
  const settleTimer = useRef(null);

  useEffect(() => {
    const heroNav = document.querySelector(".sec--hero .nav");
    if (!heroNav) return;
    const update = (selectSection = true) => {
      const stuck = heroNav.getBoundingClientRect().bottom <= 0;
      setVisible(stuck);
      if (!selectSection || navigating.current) return;
      const height = bar.current?.getBoundingClientRect().height || 89;
      let current = "#top";
      let nearest = -Infinity;
      for (const [href] of links) {
        const section = document.querySelector(href);
        const top = section?.getBoundingClientRect().top;
        if (top <= height + 24 && top > nearest) { current = href; nearest = top; }
      }
      setActive(current);
    };
    const finishNavigation = () => {
      clearTimeout(settleTimer.current);
      navigating.current = false;
      update();
    };
    // Manual scrolling tracks sections; anchor scrolling holds the clicked selection.
    const onScroll = () => {
      update();
      if (navigating.current) {
        clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(finishNavigation, 180);
      }
    };
    const onResize = () => update();
    const onNavigationClick = event => {
      const href = event.target.closest("a")?.getAttribute("href");
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !links.some(([target]) => target === href)) return;
      navigating.current = true;
      setActive(href);
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(finishNavigation, 350);
    };
    bar.current.addEventListener("click", onNavigationClick);
    const currentBar = bar.current;
    const resize = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--sticky-nav-height", `${bar.current?.getBoundingClientRect().height || 89}px`);
      update();
    });
    resize.observe(bar.current);
    const originalMenu = document.getElementById("menu");
    const menuObserver = new MutationObserver(() => setOpen(!originalMenu.hidden));
    menuObserver.observe(originalMenu, { attributes: true, attributeFilter: ["hidden"] });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("scrollend", finishNavigation);
    update();
    return () => {
      resize.disconnect();
      menuObserver.disconnect();
      clearTimeout(settleTimer.current);
      currentBar.removeEventListener("click", onNavigationClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scrollend", finishNavigation);
      document.documentElement.style.removeProperty("--sticky-nav-height");
    };
  }, []);

  return (
    <nav ref={bar} className={`sticky-nav${visible ? " is-visible" : ""}`} aria-label="Sticky main navigation" inert={!visible} aria-hidden={!visible}>
      <a className="sticky-nav__logo" href="#top"><img src="/assets/img/sticky-logo.png" width="409" height="138" alt="Veterans Advocate Center, home" /></a>
      <div className="sticky-nav__actions">
        <ul className="sticky-nav__links">
          {links.map(([href, label]) => <li key={href}><a href={href} aria-current={active === href ? "location" : undefined}>{label}</a></li>)}
        </ul>
        <a className="sticky-nav__phone" href="tel:+18778222023" aria-label="Call +1 877-822-2023"><img src="/assets/svg/sticky-phone.svg" alt="" width="18" height="18" /><span>877-822-2023</span></a>
        <a className="sticky-nav__cta" href="#evaluation">Talk with VAC</a>
        <button className="sticky-nav__toggle" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="menu" onClick={() => document.querySelector(".sec--hero .nav__menu")?.click()}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2.5" /></svg></button>
      </div>
    </nav>
  );
}
