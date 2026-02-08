import React, { useEffect, useRef } from 'react'
import { Send, Mic, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function UserInput({
  message,
  onChange,
  onSubmit,
  disabled
}: {
  message: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={onSubmit} className="border-t border-gray-800 p-4 bg-gray-900">
      <div className="flex items-end space-x-2">
        <div className="relative flex-1">
          <Input
            as="textarea"
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your cloud infrastructure..."
            className="min-h-[56px] max-h-[200px] p-3 pr-12 rounded-2xl border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-kubemind-purple-500"
            ref={textareaRef}
            disabled={disabled}
          />
          <div className="absolute right-3 bottom-3 flex space-x-2">
            <button 
              type="button" 
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={disabled || !message.trim()}
          variant="primary"
          size="icon"
          className="w-12 h-12 rounded-full p-0"
        >
          <Send className="w-6 h-6" />
        </Button>
      </div>
    </form>
  )
}
