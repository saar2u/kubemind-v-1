import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block p-4 bg-red-500/10 rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-kubemind-purple-400 to-kubemind-purple-600">
          404
        </h1>
        
        <h2 className="text-2xl font-bold mb-4 text-white">Page Not Found</h2>
        
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" variant="primary">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/chat">
            <Button size="lg" variant="secondary">
              Go to Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
