import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import ReassuranceBanner from "./components/sections/Reassurance";
import AboutSection from "./components/sections/About";
import GamesSection from "./components/sections/Games";
import FounderSection from "./components/sections/Founder";
import NewsletterSection from "./components/sections/Newsletter";
import ContactSection from "./components/sections/Contact";

function App() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Ordre de la page d'accueil (refonte Sprint 10) :
  // hero vedette → réassurance → notre univers → nos créations → fondateur →
  // notification de lancement → contact.
  return (
    <div className="min-h-screen bg-cream">
      <Header onNavigate={scrollToSection} />
      <main>
        <Hero onNavigate={scrollToSection} />
        <ReassuranceBanner />
        <AboutSection />
        <GamesSection />
        <FounderSection />
        <NewsletterSection onNavigate={scrollToSection} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
