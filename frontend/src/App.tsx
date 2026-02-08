import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAccountStore } from './lib/store/accountStore'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Connections from './pages/Connections'
import NotFound from './pages/NotFound'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorModal } from './components/modals/ErrorModal'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAccountStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  const [error, setError] = useState<Error | null>(null)
  
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('App Error:', error, errorInfo)
    setError(error)
  }

  return (
    <ErrorBoundary FallbackComponent={() => null} onError={handleError}>
      <BrowserRouter>
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ErrorModal isOpen={!!error} onClose={() => setError(null)} error={error} />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
export default App
