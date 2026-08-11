import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Stats from "../components/Stats";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import CallToAction from "../components/CallToAction";
import Founder from "../components/Founder";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-indigo-900 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <CallToAction />
      <Founder />
      <Footer />
    </main>
  );
}