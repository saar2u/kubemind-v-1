import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Trash2, AlertTriangle, X, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

export default function ProfileView() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('kubemind-user-name') || 'User';
  const userEmail = localStorage.getItem('kubemind-user-email') || 'user@example.com';
  const userAvatar = localStorage.getItem('kubemind-user-avatar');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    
    // Simulate API call to delete user data & connections
    setTimeout(() => {
      // Clear all local storage and redirect to home
      localStorage.clear();
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
          <User className="text-[#00D4FF]" /> Profile Settings
        </h1>
        <p className="text-slate-500">Manage your account details and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* --- PERSONAL INFO CARD --- */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-[#0F172A]">Personal Information</h2>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-4xl shadow-sm">
                  {userName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A]">{userName}</h3>
                <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                  <Shield size={12} /> Authenticated via Google
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-500">
                  <User size={18} className="text-slate-400" />
                  {userName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-500">
                  <Mail size={18} className="text-slate-400" />
                  {userEmail}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* --- PREFERENCES CARD (UI Demo) --- */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-[#0F172A]">Preferences</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Bell size={20} /></div>
                <div>
                  <h4 className="font-bold text-[#0F172A]">Email Notifications</h4>
                  <p className="text-sm text-slate-500">Receive alerts when Agent Kube modifies resources.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-[#00D4FF] rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- DANGER ZONE --- */}
        <div className="bg-white border border-rose-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-rose-100 bg-rose-50/30">
            <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle size={20} /> Danger Zone
            </h2>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-[#0F172A]">Delete Account</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Permanently delete your Kubemind account, active cloud connections, and chat history. This action cannot be undone.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full md:w-auto px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200 transition-colors flex justify-center items-center gap-2 shrink-0"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-rose-100"
            >
              <button 
                onClick={() => { setShowDeleteModal(false); setConfirmEmail(''); }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Delete Account Permanently</h3>
              <p className="text-slate-500 mb-6">
                You will lose all your active connections and data from the Kubemind platform. 
                <span className="font-bold text-rose-600 block mt-2">This action cannot be undone.</span>
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Please type <span className="text-[#0F172A] select-all bg-white px-2 py-0.5 rounded border border-slate-200">{userEmail}</span> to confirm.
                </label>
                <input 
                  type="text" 
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Enter your email to confirm"
                  disabled={isDeleting}
                  className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none transition-all text-[#0F172A]"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowDeleteModal(false); setConfirmEmail(''); }}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={confirmEmail !== userEmail || isDeleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:hover:bg-rose-600 flex justify-center items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
