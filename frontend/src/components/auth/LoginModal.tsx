import React, { useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { useAccountStore } from '@/lib/store/accountStore'
import { useUIStore } from '@/lib/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z.01-.01z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
)

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen } = useUIStore()
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAccountStore()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isLoginModalOpen) return null

  const handleGoogleLogin = async () => {
    setIsLoading(true); setError(null);
    try {
      await signInWithGoogle()
      setLoginModalOpen(false)
    } catch (err: any) {
      console.error(err)
      setError("Google Sign-In failed. Check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(null);
    try {
      if (mode === 'signin') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
      setLoginModalOpen(false)
    } catch (err: any) {
      let msg = "Authentication failed."
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password."
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-400 mt-2 text-sm">Sign in to manage your cloud infrastructure</p>
        </div>

        {/* FIXED: Added explicit background, text color, and hover state */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading} 
          className="w-full bg-white text-black hover:bg-gray-100 h-12 mb-6 rounded-lg font-bold flex items-center justify-center transition-all transform active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 text-black" /> : (
            <>
              <GoogleLogo />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
          <span className="relative bg-gray-900 px-2 text-gray-500 text-sm">Or continue with email</span>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-gray-800 border-gray-700 h-11 text-white" />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-gray-800 border-gray-700 h-11 text-white" />
          
          {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle className="w-4 h-4" />{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full bg-kubemind-purple-600 hover:bg-kubemind-purple-700 h-12 font-semibold">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-kubemind-purple-400 font-medium hover:underline">{mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Log in'}</button>
        </div>
      </div>
    </div>
  )
}
