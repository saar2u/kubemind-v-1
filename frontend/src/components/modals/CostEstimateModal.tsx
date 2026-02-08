import React from 'react'
import { X, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface CostEstimateModalProps {
  isOpen: boolean
  onClose: () => void
  estimate?: {
    monthly: number
    yearly: number
    savings: number
    paybackPeriod: string
  }
}

export function CostEstimateModal({ isOpen, onClose, estimate }: CostEstimateModalProps) {
  if (!isOpen) return null

  const est = estimate || {
    monthly: 500,
    yearly: 6000,
    savings: 1200,
    paybackPeriod: '3 months'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Cost Estimate</h3>
                <p className="mt-2 text-gray-400">
                  Projected costs and savings analysis
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Monthly Cost</p>
                  <p className="text-2xl font-bold text-white">${est.monthly.toLocaleString()}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Yearly Cost</p>
                  <p className="text-2xl font-bold text-white">${est.yearly.toLocaleString()}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Annual Savings</p>
                  <p className="text-2xl font-bold text-green-400">+${est.savings.toLocaleString()}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Payback Period</p>
                  <p className="text-2xl font-bold text-white">{est.paybackPeriod}</p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-300 mb-1">Optimization Opportunity</h4>
                    <p className="text-sm text-green-200">
                      Based on your current infrastructure, we estimate you can save approximately 
                      ${est.savings.toLocaleString()} annually by implementing our recommendations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button variant="primary" className="flex-1">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
