import { CtaBand } from "@/components/home/cta-band";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { ValuesMarquee } from "@/components/home/values-marquee";

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <HowItWorks />
      <ValuesMarquee />
      <Features />
      <CtaBand />
    </div>
  );
}
