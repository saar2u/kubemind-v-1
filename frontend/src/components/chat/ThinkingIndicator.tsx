import React from 'react'
import { Loader2 } from 'lucide-react'

export default function ThinkingIndicator() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-kubemind-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-kubemind-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-kubemind-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="ml-2 text-gray-400">Thinking...</span>
    </div>
  )
}
