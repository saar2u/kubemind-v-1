import React from 'react';
import ParticleBackground from '../components/ui/ParticleBackground';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import UseCasesGrid from '../components/sections/UseCases';

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-[#00D4FF] selection:text-white relative">
      <ParticleBackground />
      <Navbar />
      <main>
        <HeroSection />
        <UseCasesGrid />
      </main>
      <Footer />
    </div>
  );
}
