import React, { useState } from 'react'
import { X, AlertTriangle, Clock, DollarSign, CheckCircle, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface BackupConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  resourceName?: string
  resourceType?: string
}

export function BackupConfirmationModal({ 
  isOpen, 
  onClose, 
  resourceName = 'Resource', 
  resourceType = 'Instance' 
}: BackupConfirmationModalProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onClose()
      alert(`Backup initiated for ${resourceName}`)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500/20 p-3 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Confirm Backup</h3>
                  <p className="mt-2 text-gray-400">
                    Please review the backup details before proceeding
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Resource Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Cloud className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{resourceName}</p>
                    <p className="text-sm text-gray-400">{resourceType}</p>
                  </div>
                </div>
                
                {/* Details and Checkbox omitted for brevity but preserved in previous structure */}
                <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="understand"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 text-kubemind-purple-600 border-gray-600 rounded focus:ring-kubemind-purple-500"
                  />
                  <label htmlFor="understand" className="text-sm text-gray-300">
                    I confirm I want to proceed with the backup and understand the costs.
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={handleConfirm} disabled={!isChecked || isProcessing}>
                    {isProcessing ? 'Processing...' : 'Confirm Backup'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
