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
import ScrollToTop from "./components/ScrollToTop";
import ChatWidget from "./components/ChatWidget";

import "./App.css";

// Show the AI chat mascot in local dev, or in production only once the backend
// URL is configured (VITE_CHATBOT_API) — keeps the live site free of a dead
// chat button until the RAG backend is deployed.
const SHOW_CHAT = import.meta.env.DEV || Boolean(import.meta.env.VITE_CHATBOT_API);

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
      <ScrollToTop />
      {SHOW_CHAT && <ChatWidget />}
    </>
  );
}

export default App;
