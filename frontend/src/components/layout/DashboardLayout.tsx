import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Key, MessageCircle, User, LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('kubemind-user-name') || 'User';
  const userAvatar = localStorage.getItem('kubemind-user-avatar');

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      localStorage.removeItem('kubemind-user-email');
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // The 5 Sidebar Items you requested
  const navItems = [
    { name: 'Chat Agent', path: '/dashboard', icon: <MessageSquare size={20} /> },
    { name: 'Dashboard Overview', path: '/dashboard/overview', icon: <LayoutDashboard size={20} /> },
    { name: 'Cloud Connections', path: '/dashboard/connections', icon: <Key size={20} /> },
    { name: 'Feedback', path: '/dashboard/feedback', icon: <MessageCircle size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xl shadow-md mr-3">K</div>
          <span className="text-xl font-bold text-[#0F172A]">Kubemind</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              end={item.path === '/dashboard'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-[rgba(0,212,255,0.1)] to-[rgba(139,92,246,0.1)] text-[#00D4FF]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Profile / Logout Section at bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-full shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                {userName.charAt(0)}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-[#0F172A] truncate">{userName}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header for Mobile only */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs">K</div>
            <span className="text-lg font-bold text-[#0F172A]">Kubemind</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500"><LogOut size={20}/></button>
        </header>

        {/* Dynamic Content (Chat, Connections, etc. loads here) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
