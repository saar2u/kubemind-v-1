import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useChatStore } from '@/lib/store/chatStore'
import { useAccountStore } from '@/lib/store/accountStore'
import { MessageSquare, LayoutDashboard, Settings, User, Plus, LogOut, CloudLightning } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Sidebar() {
  const { clearMessages } = useChatStore()
  // Now using signOut which is cleaner, but setUnauthenticated is also available if needed
  const { signOut, connectedAccounts } = useAccountStore()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Connections', href: '/connections', icon: CloudLightning },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings }
  ]

  const handleLogout = async () => {
    clearMessages()
    await signOut()
    navigate('/')
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <img src="/kubemind-logo.jpg" alt="Kubemind" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1" />
          <span className="text-xl font-bold text-white">Kubemind</span>
        </div>
        <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/chat')}>
          <Plus className="w-4 h-4 mr-2" /> New Chat
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</h3>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.href}>
                  <Link to={item.href} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-kubemind-purple-500/20 text-kubemind-purple-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-red-400" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </Button>
      </div>
    </aside>
  )
}
