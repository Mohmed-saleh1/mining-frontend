import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactPageContent from "../components/ContactPageContent";

export const metadata = {
  title: "Contact Us - LOGIM",
  description: "Get in touch with our support team. We're here to help you 24/7.",
};

export default function ContactPage() {
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
          <ContactPageContent />
        </main>
        <Footer />
      </div>
    </div>
  );
}

