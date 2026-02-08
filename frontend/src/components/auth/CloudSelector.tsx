import React from 'react'
import { AWS, Azure, GCP } from './OAuthButton'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

interface CloudSelectorProps {
  onClose: () => void
}

export default function CloudSelector({ onClose }: CloudSelectorProps) {
  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Choose Your Cloud Provider</h3>
          <p className="text-gray-400 mt-2">
            Securely connect your account with OAuth
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AWS />
          <Azure />
          <GCP />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Having trouble?{' '}
            <a href="/docs/setup" className="text-kubemind-purple-400 hover:text-kubemind-purple-300">
              View setup guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
