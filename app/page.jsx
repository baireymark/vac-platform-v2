// The VAC V4 homepage, converted from index.html. Every section is a server component;
// the browser behaviour comes from the original scripts, loaded by LegacyScripts after hydration.
import Hero from "@/components/Hero.jsx";
import Calculator from "@/components/Calculator.jsx";
import Intake from "@/components/Intake.jsx";
import Routes from "@/components/Routes.jsx";
import Stories from "@/components/Stories.jsx";
import Trust from "@/components/Trust.jsx";
import Process from "@/components/Process.jsx";
import Guides from "@/components/Guides.jsx";
import Faq from "@/components/Faq.jsx";
import CallIn from "@/components/CallIn.jsx";
import Contact from "@/components/Contact.jsx";
import Footer from "@/components/Footer.jsx";
import Menu from "@/components/Menu.jsx";
import LegacyScripts from "@/components/LegacyScripts.jsx";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Hero />
      <main id="main">
        <Calculator />
        <Intake />
        <Routes />
        <Stories />
        <Trust />
        <Process />
        <Guides />
        <Faq />
        <CallIn />
        <Contact />
      </main>
      <Footer />
      <Menu />
      <LegacyScripts />
    </>
  );
}
