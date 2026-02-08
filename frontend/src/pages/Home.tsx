import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAccountStore } from '@/lib/store/accountStore'
import { useUIStore } from '@/lib/store/uiStore'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoginModal from '@/components/auth/LoginModal'

// Import Landing Page Sections
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import UseCases from '@/components/landing/UseCases'
import BlogPreview from '@/components/landing/BlogPreview'

interface SnowParticle {
  x: number; y: number; size: number; speed: number; opacity: number;
}

export default function Home() {
  const { isAuthenticated } = useAccountStore()
  const { isLoginModalOpen, setLoginModalOpen } = useUIStore()
  const [snowParticles, setSnowParticles] = useState<SnowParticle[]>([])

  useEffect(() => {
    const createSnow = () => {
      const particles: SnowParticle[] = []
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.7 + 0.3
        })
      }
      setSnowParticles(particles)
    }
    createSnow()
    const animateSnow = () => {
      setSnowParticles(prev => prev.map(p => ({
        ...p, y: p.y + p.speed, x: p.x + Math.sin(p.y * 0.01) * 0.5
      })))
    }
    const interval = setInterval(animateSnow, 50)
    return () => clearInterval(interval)
  }, [])

  // FIX: Use React Router <Navigate> instead of window.location.href
  // This prevents the "infinite reload" loop
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        {snowParticles.map((p, i) => (
          <div key={i} className="absolute bg-white rounded-full" style={{
            left: `${p.x}px`, top: `${p.y % window.innerHeight}px`,
            width: `${p.size}px`, height: `${p.size}px`, opacity: p.opacity, filter: 'blur(1px)'
          }} />
        ))}
      </div>

      <Header />

      <section className="relative z-10 pt-48 pb-32 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
          Your Cloud Co-Pilot <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-kubemind-purple-400 to-indigo-500">
            Zero Keys Stored
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          The AI-powered infrastructure assistant that optimizes costs, secures assets, and automates DevOps — without ever seeing your private keys.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button size="lg" className="px-8 py-6 text-lg" onClick={() => setLoginModalOpen(true)}>
            Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" asChild>
            <Link to="/dashboard">View Live Demo</Link>
          </Button>
        </div>
        
        <div className="pt-8 border-t border-gray-800/50">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-6">Trusted by engineers at</p>
          <div className="flex justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <span className="text-xl font-bold text-gray-400">ACME Corp</span>
            <span className="text-xl font-bold text-gray-400">Globex</span>
            <span className="text-xl font-bold text-gray-400">Soylent</span>
            <span className="text-xl font-bold text-gray-400">Initech</span>
          </div>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <UseCases />
      <BlogPreview />

      <Footer />
      {isLoginModalOpen && <LoginModal />}
    </div>
  )
}
