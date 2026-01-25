import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import GamesSection from "./components/sections/Games";
import AboutSection from "./components/sections/About";
import ContactSection from "./components/sections/Contact";
import Carousel from "./components/common/Carousel";
import "./styles/global.css";

function App() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffe9", minHeight: "100vh" }}>
      <Header onNavigate={scrollToSection} />
      <main>
        <Hero onNavigate={scrollToSection} />
        <Carousel />
        <GamesSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
