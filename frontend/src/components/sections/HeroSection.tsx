import React from 'react';
import Hero3D from './Hero3D';

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden" id="hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Typography */}
        <div className="z-10 flex flex-col items-start text-left">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#0F172A] leading-tight mb-6">
            Your Autonomous <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]">Cloud Architect</span>
          </h1>
          <p className="text-lg lg:text-xl text-[#475569] mb-8 max-w-xl leading-relaxed">
            Kubemind connects to AWS, Azure, and GCP to execute cloud operations through natural language. No dashboards. No complexity. Just results.
          </p>
          
          <div className="mt-8 pt-8 border-t border-[rgba(0,212,255,0.1)] w-full">
            <p className="text-sm text-slate-400 font-medium mb-4 uppercase tracking-wider">Connects seamlessly with</p>
            <div className="flex gap-6 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-bold text-[#FF9900] text-xl">AWS</span>
              <span className="font-bold text-[#0089D6] text-xl">Azure</span>
              <span className="font-bold text-[#00C896] text-xl">GCP</span>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Scene */}
        <div className="relative h-[500px] lg:h-[700px] w-full z-10 hidden md:block">
          <Hero3D />
        </div>
        
      </div>
    </section>
  );
}
