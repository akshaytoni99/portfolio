import AIBackground from "./components/AIBackground";
import FloatingOrbs from "./components/FloatingOrbs";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import ScrollProgress from "./components/ScrollProgress";
import CursorGlow from "./components/CursorGlow";
import CursorTrail from "./components/CursorTrail";
import Hero from "./components/Hero";
import About from "./components/About";
import SectionDivider from "./components/SectionDivider";
import Experience from "./components/Experience";
import TechStack from "./components/TechStack";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <>
      <LoadingScreen />
      <AIBackground />
      <FloatingOrbs />
      <CursorGlow />
      <CursorTrail />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <SectionDivider />
        <Experience />
        <SectionDivider />
        <TechStack />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Certifications />
        <SectionDivider />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
