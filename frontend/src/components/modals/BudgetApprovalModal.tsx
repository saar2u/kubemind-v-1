import React, { useState } from 'react'
import { X, AlertTriangle, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BudgetApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  amount?: number
  reason?: string
}

export function BudgetApprovalModal({ 
  isOpen, 
  onClose, 
  amount = 100, 
  reason = 'Infrastructure scaling' 
}: BudgetApprovalModalProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleApprove = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onClose()
      alert(`Budget of $${amount} approved for: ${reason}`)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Budget Approval Required</h3>
                <p className="mt-2 text-gray-400">
                  Please review and approve this budget request
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={isProcessing}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-2xl font-bold text-white">${amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Reason</span>
                  <span className="font-medium text-white">{reason}</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Budget Alert</h4>
                    <p className="text-sm text-blue-200">
                      This request exceeds your monthly budget threshold. Please review carefully 
                      before approving.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="approve"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-kubemind-purple-600 border-gray-600 rounded focus:ring-kubemind-purple-500"
                />
                <label htmlFor="approve" className="text-sm text-gray-300">
                  I approve this budget increase of ${amount.toLocaleString()} for {reason.toLowerCase()}.
                  I understand this will be charged to my account.
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isProcessing}>
                  Decline
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleApprove} disabled={!isChecked || isProcessing}>
                  {isProcessing ? 'Approving...' : 'Approve Budget'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
