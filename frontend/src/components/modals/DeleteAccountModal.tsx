import React, { useState } from 'react'
import { X, AlertTriangle, Trash2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleDelete = () => {
    if (!isChecked) return
    
    setIsProcessing(true)
    onConfirm()
    // The actual deletion is handled by the parent component
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500/20 p-3 rounded-full mr-4">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Delete Account</h3>
                  <p className="mt-2 text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={isProcessing}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-300 mb-1">Warning</h4>
                    <p className="text-sm text-red-200">
                      Deleting your account will permanently remove all your data, including:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-red-100">
                      <li>• All chat history and conversations</li>
                      <li>• Connected cloud accounts and configurations</li>
                      <li>• Resource inventory and analysis data</li>
                      <li>• User preferences and settings</li>
                    </ul>
                    <p className="mt-3 text-sm text-red-200">
                      This action cannot be undone. Please be certain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="confirm-delete"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-600 rounded focus:ring-red-500"
                />
                <label htmlFor="confirm-delete" className="text-sm text-gray-300">
                  I understand that deleting my account will permanently remove all my data and 
                  this action cannot be undone. I want to proceed with account deletion.
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  onClick={handleDelete} 
                  disabled={!isChecked || isProcessing}
                >
                  {isProcessing ? 'Deleting...' : 'Delete Account Permanently'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
