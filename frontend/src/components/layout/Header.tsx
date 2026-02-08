import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAccountStore } from '@/lib/store/accountStore'
import { useUIStore } from '@/lib/store/uiStore'
import { Menu, X, CloudLightning } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Header() {
  const { isAuthenticated, signOut } = useAccountStore()
  const { setLoginModalOpen } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Use Cases', href: '/#use-cases' },
    { label: 'Blog', href: '/#blog' }
  ]

  const handleNavClick = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const id = href.replace('/#', '')
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const id = href.replace('/#', '')
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/kubemind-logo.jpg" alt="Kubemind Logo" className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-kubemind-purple-400 to-kubemind-purple-600">
              Kubemind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isAuthenticated && navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                 <Button variant="ghost" onClick={() => navigate('/connections')} className="text-gray-300 hover:text-white">
                   <CloudLightning className="w-4 h-4 mr-2" /> Connections
                 </Button>
                 <Button variant="ghost" onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                   Sign Out
                 </Button>
                 <Button variant="primary" onClick={() => navigate('/dashboard')}>
                   Dashboard
                 </Button>
              </div>
            ) : (
              <Button variant="primary" onClick={() => setLoginModalOpen(true)}>
                Sign In
              </Button>
            )}
          </nav>

          <button className="md:hidden p-2 text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  )
}
