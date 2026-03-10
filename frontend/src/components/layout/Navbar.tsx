import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate(); // <-- Use React Router for smooth navigation

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user.email) {
        // Save user data for the Dashboard sidebar
        localStorage.setItem('kubemind-user-email', result.user.email);
        localStorage.setItem('kubemind-user-name', result.user.displayName || 'User');
        localStorage.setItem('kubemind-user-avatar', result.user.photoURL || '');
      }
      
      setShowAuthModal(false);
      
      // Instantly push the user to the dashboard without reloading the page!
      navigate('/dashboard'); 
      
    } catch (error: any) {
      console.error("Auth Error:", error);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xl shadow-lg">K</div>
              <span className="text-xl font-bold text-[#0F172A] tracking-tight">Kubemind</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#hero" className="text-sm font-semibold text-slate-600 hover:text-[#00D4FF] transition-colors">Platform</a>
              <a href="#use-cases" className="text-sm font-semibold text-slate-600 hover:text-[#00D4FF] transition-colors">Use Cases</a>
              <a href="/docs" className="text-sm font-semibold text-slate-600 hover:text-[#00D4FF] transition-colors">Docs</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] hover:scale-105 rounded-full shadow-md transition-transform"
              >
                Sign In
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button className="text-[#0F172A] hover:text-[#00D4FF] transition-colors">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-2"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">K</div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome to Kubemind</h3>
              <p className="text-slate-500">Select an option to continue</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                New Member (Register)
              </button>
              <button 
                onClick={handleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Already a User (Log In)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
