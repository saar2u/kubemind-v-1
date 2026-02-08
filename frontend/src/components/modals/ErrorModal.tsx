import React from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  error: Error | null
}

export function ErrorModal({ isOpen, onClose, error }: ErrorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500/20 p-3 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Something Went Wrong</h3>
                  <p className="mt-2 text-gray-400">
                    We encountered an error. Please try again or contact support.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 break-all">{error.message}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  onClose()
                  window.location.href = '/'
                }}
              >
                Return Home
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
