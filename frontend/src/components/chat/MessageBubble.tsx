import React from 'react'
import { Message } from '@/types/chat'
import { CopyButton } from '@/components/ui/CopyButton'
import { MessageSquare } from 'lucide-react'

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl rounded-2xl p-4 shadow-sm transition-all ${
        isUser 
          ? 'bg-kubemind-purple-600 text-white rounded-br-none' 
          : 'bg-gray-800 text-gray-200 rounded-bl-none'
      }`}>
        <div className="flex items-start">
          {isAssistant && (
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-kubemind-purple-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <div className="prose prose-invert max-w-none">
              {message.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
            
            <div className="mt-3 flex justify-end">
              <CopyButton text={message.content} />
            </div>
          </div>
          
          {isUser && (
            <div className="flex-shrink-0 ml-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="text-white font-bold">U</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
