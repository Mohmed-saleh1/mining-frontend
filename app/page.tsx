import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Benefits from "./components/Benefits";
import FeaturedMachines from "./components/FeaturedMachines";
import HowItWorks from "./components/HowItWorks";
import CryptoPricing from "./components/CryptoPricing";
import SecurityTrust from "./components/SecurityTrust";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen main-bg relative">
      {/* Starfield background effect */}
      <div className="starfield" />
      
      {/* Golden particles effect */}
      <div className="golden-particles" />
      
      {/* Main content */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Benefits />
          <FeaturedMachines />
          <HowItWorks />
          <CryptoPricing />
          <SecurityTrust />
          <Testimonials />
          <FAQ />
          <ContactForm />
        </main>
        <Footer />
      </div>
    </div>
  );
}
