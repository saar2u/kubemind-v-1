import React from 'react'
import { X } from 'lucide-react'
import { Badge } from './Badge'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: (id: string) => void
}

const typeConfig = {
  success: { icon: '✓', variant: 'success' as const },
  error: { icon: '✗', variant: 'danger' as const },
  warning: { icon: '!', variant: 'warning' as const },
  info: { icon: 'i', variant: 'info' as const },
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  const config = typeConfig[type]

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
        <span className="text-lg font-bold">{config.icon}</span>
      </div>
      
      <div className="flex-1">
        <p className="text-white">{message}</p>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        aria-label="Close toast"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { 
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>; 
  onClose: (id: string) => void 
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
