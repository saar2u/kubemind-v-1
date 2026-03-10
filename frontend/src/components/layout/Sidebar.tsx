import React, { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useChatStore } from '@/lib/store/chatStore'
import { useAccountStore } from '@/lib/store/accountStore'
import {
  MessageSquare,
  LayoutDashboard,
  Settings,
  User,
  Plus,
  LogOut,
  CloudLightning,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import '@/styles/sidebar-styles.css'

interface TokenInfo {
  token_balance: number
  token_limit: number
  tokens_used_total: number
  next_reset: string
  reset_in_hours: number
}

export default function Sidebar() {
  const { clearMessages } = useChatStore()
  const { signOut, user } = useAccountStore()
  const location = useLocation()
  const navigate = useNavigate()

  // --- COMPONENT STATE ---
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    token_balance: 200000,
    token_limit: 200000,
    tokens_used_total: 0,
    next_reset: new Date().toISOString(),
    reset_in_hours: 24
  })
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  const userId = localStorage.getItem('kubemind-user-email') || 'default_user'
  const userName = user?.name || localStorage.getItem('kubemind-user-name')?.split(' ')[0] || 'User'

  // --- TOKEN FETCHING ---
  const fetchTokenBalance = async () => {
    setIsLoadingTokens(true)
    try {
      // Trying the guide's recommended endpoint with the production base URL
      const res = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/tokens/balance', {
        headers: {
          'x_user_email': userId, // Using email as identifier per previous patterns
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        setTokenInfo(data)
      } else {
        // Fallback to the status endpoint if balance fails
        const statusRes = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/user/status', {
          headers: { 'x_user_id': userId }
        })
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          setTokenInfo({
            token_balance: statusData.remaining,
            token_limit: 200000, // Assuming 200k limit
            tokens_used_total: 200000 - statusData.remaining,
            next_reset: new Date().toISOString(),
            reset_in_hours: parseInt(statusData.resetIn) || 5
          })
        }
      }
    } catch (e) {
      console.error("Token fetch failed", e)
    } finally {
      setIsLoadingTokens(false)
    }
  }

  useEffect(() => {
    fetchTokenBalance()
    const interval = setInterval(fetchTokenBalance, 30000) // 30s as per guide
    return () => clearInterval(interval)
  }, [userId])

  // --- NAVIGATION CONFIG ---
  const navigation = [
    { name: 'Chat Agent', href: '/chat', icon: MessageSquare, badge: null },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Connections', href: '/connections', icon: CloudLightning, badge: 'AWS' },
    { name: 'Admin Console', href: '/admin', icon: Shield, badge: null },
    { name: 'Profile', href: '/profile', icon: User, badge: null },
    { name: 'Settings', href: '/settings', icon: Settings, badge: null }
  ]

  // --- HELPERS ---
  const tokenStatus = useMemo(() => {
    const percentage = (tokenInfo.token_balance / tokenInfo.token_limit) * 100

    if (percentage < 5) {
      return { percentage, status: 'critical', color: 'bg-red-500', textColor: 'text-red-300' }
    } else if (percentage < 20) {
      return { percentage, status: 'low', color: 'bg-orange-500', textColor: 'text-orange-200' }
    }

    return { percentage, status: 'normal', color: 'bg-white', textColor: 'text-white' }
  }, [tokenInfo])

  const handleLogout = async () => {
    clearMessages()
    // CRITICAL FIX: Wipe all local storage so new users don't see old user's data!
    localStorage.removeItem('kubemind-user-email')
    localStorage.removeItem('kubemind-user-name')
    localStorage.removeItem('access_token')
    localStorage.removeItem(`kubemind-chat-${userId}`) // <-- Add this line!
    await signOut()
    navigate('/')
  }

  return (
    <aside
      className={`bg-[#F8FAFC] border-r border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out font-sans ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Header & Collapse Toggle */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-kubemind-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200 shrink-0">
              K
            </div>
            {!isCollapsed && (
              <span className="text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap logo-text">
                Kubemind
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          className={`w-full bg-[#0F172A] hover:bg-[#1E293B] text-white transition-all shadow-md active:scale-95 flex items-center justify-center ${isCollapsed ? 'px-0' : 'px-4'}`}
          onClick={() => navigate('/chat')}
        >
          <Plus className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
          {!isCollapsed && <span className="font-bold">New Chat</span>}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 nav-scroll">
        <div className="px-4">
          {!isCollapsed && (
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">
              Main Menu
            </h3>
          )}
          <ul className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-2xl transition-all group relative overflow-hidden ${isActive
                        ? 'bg-white text-kubemind-purple-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 nav-item-hover'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-kubemind-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full ml-3">
                        <span className="font-bold text-sm whitespace-nowrap nav-text">{item.name}</span>
                        {item.badge && (
                          <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {isCollapsed && isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kubemind-purple-500 rounded-r-full" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 bg-[#F8FAFC]">

        {/* Token Limit Card - Premium Look */}
        {!isCollapsed && (
          <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-xl shadow-purple-100 relative overflow-hidden token-section">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-shimmer" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70 flex items-center">
                  <Zap size={10} className="mr-1" /> Agent Resources
                </span>
                <button
                  onClick={fetchTokenBalance}
                  className={`hover:rotate-180 transition-transform duration-500 ${isLoadingTokens ? 'animate-spin' : ''}`}
                >
                  <RefreshCw size={10} />
                </button>
              </div>

              <div className="flex items-baseline gap-1.5 mb-2">
                <span className={`text-2xl font-black tracking-tighter transition-colors ${tokenStatus.textColor}`}>
                  {tokenInfo.token_balance.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-white/50">/ {tokenInfo.token_limit / 1000}k</span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-black/15 rounded-full h-2.5 overflow-hidden p-[1px]">
                <div
                  className={`h-full rounded-full token-progress-bar ${tokenStatus.color}`}
                  style={{ width: `${tokenStatus.percentage}%` }}
                ></div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[9px] text-white/80 font-bold flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5" /> Next reset in {tokenInfo.reset_in_hours}h
                </div>
                <div className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-bold uppercase">
                  {Math.round(tokenStatus.percentage)}%
                </div>
              </div>

              {tokenStatus.status !== 'normal' && (
                <div className="mt-3 py-1 bg-white/10 rounded-lg text-center animate-pulse">
                  <span className="text-[9px] font-black uppercase tracking-tighter">
                    {tokenStatus.status === 'critical' ? '⚠️ CRITICAL LIMIT' : '⚡ LOW BALANCE'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Profile Area */}
        <div className={`flex items-center justify-between p-2 pt-4 border-t border-slate-200/60 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 group hover:border-kubemind-purple-300 transition-colors">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={userName} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400 group-hover:text-kubemind-purple-500 transition-colors" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm text-slate-800 truncate leading-none mb-1">
                  {userName}
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate">
                  {user?.email || userId}
                </span>
              </div>
            )}
          </div>

          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-1'}`}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

      </div>
    </aside>
  )
}
