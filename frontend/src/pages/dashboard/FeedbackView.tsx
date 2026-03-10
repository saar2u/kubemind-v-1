import React, { useState } from 'react';
import { MessageSquare, Bug, Lightbulb, Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackType = 'Idea' | 'Issue' | 'Other';

export default function FeedbackView() {
  const [type, setType] = useState<FeedbackType>('Idea');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating!");
      return;
    }

    setStatus('submitting');

    const payload = {
      user: localStorage.getItem('kubemind-user-email') || 'Anonymous',
      type,
      rating,
      message,
      date: new Date().toISOString(),
    };

    try {
      // YOUR LIVE GOOGLE APPS SCRIPT WEBHOOK URL
      const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxYr8r93cdtoi-UtPNzYY7Na1ukyILC6fTwBB3BYCOPnVycmPf2GLhAYCoIm5bF7yLY/exec';

      // mode: 'no-cors' is required so the browser doesn't block the request to Google's servers
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Because 'no-cors' prevents us from reading the response, we assume success if no network error occurred
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto w-full pt-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Thank you!</h2>
          <p className="text-slate-500 mb-8">Your feedback has been sent directly to the development team.</p>
          <button onClick={() => { setStatus('idle'); setMessage(''); setRating(0); }} className="px-8 py-3 bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-bold rounded-xl transition-colors">
            Send More Feedback
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full pb-12 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
          <MessageSquare className="text-[#00D4FF]" /> Send Feedback
        </h1>
        <p className="text-slate-500">Help us improve Agent Kube. Let us know what's working and what isn't.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Feedback Type Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">What kind of feedback is this?</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'Idea', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                { id: 'Issue', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
                { id: 'Other', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as FeedbackType)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    type === t.id ? `${t.bg} ${t.border}` : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <t.icon size={24} className={type === t.id ? t.color : 'text-slate-400'} />
                  <span className={`font-bold text-sm ${type === t.id ? 'text-slate-800' : 'text-slate-500'}`}>{t.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">How would you rate your experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    size={36} 
                    className={`transition-colors duration-200 ${
                      (hoveredRating || rating) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'fill-slate-100 text-slate-200 hover:text-amber-200'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Tell us more</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you love? What's frustrating? How can we make it better?"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[150px] resize-none focus:bg-white focus:ring-2 focus:ring-[#00D4FF] focus:border-[#00D4FF] outline-none transition-all text-[#0F172A]"
            />
          </div>

          {status === 'error' && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> Something went wrong. Please try again.
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-2xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending...' : <><Send size={18} /> Submit Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
}
