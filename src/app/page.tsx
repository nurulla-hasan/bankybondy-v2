import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/home/hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <Hero />
      </main>
    </div>
  );
}


