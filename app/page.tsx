import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import HowItWorks from '../components/home/HowItWorks';
import AgentPreview from '../components/home/AgentPreview';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <AgentPreview />
      </main>
      <Footer />
    </>
  );
}
