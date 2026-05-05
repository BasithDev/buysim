import HeroSection from '../components/home/HeroSection';
import HowItWorks from '../components/home/HowItWorks';
import AgentPreview from '../components/home/AgentPreview';

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <HowItWorks />
        <AgentPreview />
      </main>
    </>
  );
}
