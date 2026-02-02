import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedMachines from "./components/FeaturedMachines";
import CryptoPricing from "./components/CryptoPricing";
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
          <FeaturedMachines />
          <CryptoPricing />
          <ContactForm />
        </main>
        <Footer />
      </div>
    </div>
  );
}
