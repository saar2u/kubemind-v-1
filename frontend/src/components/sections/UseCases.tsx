import React, { useState, MouseEvent } from 'react';
import { useCases, UseCase } from '../../data/useCasesData';
import { BellRing, Coins, Shield, Network, TerminalSquare, Cpu, X, Copy, CheckCircle2 } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  BellRing: <BellRing size={28} className="text-[#00D4FF]" />,
  Coins: <Coins size={28} className="text-[#00C896]" />,
  Shield: <Shield size={28} className="text-[#8B5CF6]" />,
  Network: <Network size={28} className="text-[#00D4FF]" />,
  TerminalSquare: <TerminalSquare size={28} className="text-[#8B5CF6]" />,
  Cpu: <Cpu size={28} className="text-[#00C896]" />,
};

// 3D Tilt Card Component
const TiltCard = ({ useCase, onClick }: { useCase: UseCase; onClick: () => void }) => {
  const [transformStyle, setTransformStyle] = useState('');

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8; // Max 8 degrees
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle, transition: transformStyle === '' ? 'transform 0.5s ease-out' : 'none' }}
      className="group cursor-pointer bg-white/60 backdrop-blur-md border border-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.3)] rounded-2xl p-6 shadow-sm hover:shadow-[0_12px_30px_rgba(0,212,255,0.15)] flex flex-col h-full relative overflow-hidden"
    >
      <div className="mb-4 p-3 bg-slate-50 rounded-xl inline-block w-fit shadow-inner group-hover:scale-110 transition-transform duration-300">
        {iconMap[useCase.icon]}
      </div>
      <h3 className="text-xl font-bold text-[#0F172A] mb-2">{useCase.title}</h3>
      <p className="text-[#475569] leading-relaxed mb-6 flex-grow">{useCase.description}</p>
      
      <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-lg mt-auto">
        <p className="text-xs text-slate-400 font-mono mb-1 uppercase tracking-wider">Example Command</p>
        <p className="text-sm font-medium text-[#00D4FF] truncate">"{useCase.exampleCommand}"</p>
      </div>
    </div>
  );
};

export default function UseCasesGrid() {
  const [selectedCase, setSelectedCase] = useState<UseCase | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 relative z-10" id="use-cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4">
            Built for Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]">Cloud Challenges</span>
          </h2>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            See how DevOps teams use Kubemind to save time, reduce risk, and move faster without writing complex scripts.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <TiltCard key={useCase.id} useCase={useCase} onClick={() => setSelectedCase(useCase)} />
          ))}
        </div>

        {/* Modal View */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedCase(null)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[rgba(0,212,255,0.2)] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setSelectedCase(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
              >
                <X size={20} />
              </button>

              {/* Left Side: Visual / Command */}
              <div className="md:w-2/5 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-8 border-r border-slate-100 flex flex-col justify-center">
                <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm inline-block w-fit">
                   {iconMap[selectedCase.icon]}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">{selectedCase.title}</h3>
                
                <div className="mt-8 bg-[#0F172A] rounded-xl p-4 shadow-lg relative group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-mono">Try this command:</span>
                    <button 
                      onClick={() => copyToClipboard(selectedCase.exampleCommand)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-[#00C896]"/> : <Copy size={16} />}
                    </button>
                  </div>
                  {/* FIX APPLIED HERE: Escaped the > symbol to {'>'} */}
                  <p className="text-[#00D4FF] font-mono text-sm leading-relaxed">
                    {'>'} {selectedCase.exampleCommand}
                  </p>
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[80vh]">
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-3">The Problem</h4>
                  <p className="text-[#475569] leading-relaxed">{selectedCase.modalContent.problem}</p>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-[#8B5CF6] uppercase tracking-wider mb-3">How Kubemind Solves It</h4>
                  <ul className="space-y-3">
                    {selectedCase.modalContent.solutionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[#475569]">
                        <div className="w-6 h-6 rounded-full bg-[rgba(0,212,255,0.1)] text-[#00D4FF] flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">
                          {idx + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Agent Output</h4>
                   <p className="text-sm font-mono text-[#0F172A]">{selectedCase.modalContent.expectedOutput}</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
