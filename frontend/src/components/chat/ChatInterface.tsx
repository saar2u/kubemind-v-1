import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/lib/store/chatStore'
import { api } from '@/lib/api/client'
import { Send, Bot, Trash2, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ChatInterface() {
  const { messages, isThinking, suggestionChips, addMessage, setThinking, setSuggestionChips, addAssistantMessage, clearMessages } = useChatStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isThinking])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    addMessage(text, 'user')
    setInput('')
    setThinking(true)
    setSuggestionChips([])

    try {
      const data = await api.chat(text)
      addAssistantMessage(data.response)
      if (data.suggestions?.length) setSuggestionChips(data.suggestions)
    } catch (e) {
      addAssistantMessage("❌ Error: Unable to reach Agent.")
    } finally { setThinking(false) }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-kubemind-purple-500/20 rounded-lg"><Bot className="w-5 h-5 text-kubemind-purple-400"/></div>
          <div><h3 className="font-semibold text-white">Kubemind Agent</h3><p className="text-xs text-gray-400">Cloud Architect & Engineer</p></div>
        </div>
        {messages.length > 0 && <Button variant="ghost" onClick={() => {if(confirm("Clear history?")) clearMessages()}} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></Button>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Sparkles className="w-12 h-12 text-kubemind-purple-400 mb-4" />
            <p className="text-lg font-medium text-white">I am your Cloud Engineer.</p>
            <p className="text-sm text-gray-400 mt-2">Try: "Create a t2.micro instance" or "Stop instance i-123"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700"><Bot className="w-4 h-4 text-kubemind-purple-400"/></div>}
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-kubemind-purple-600 text-white' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isThinking && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700"><Bot className="w-4 h-4 text-kubemind-purple-400"/></div><div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"/><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"/><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"/></div></div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950/50 space-y-4">
        {suggestionChips.length > 0 && !isThinking && <div className="flex flex-wrap gap-2">{suggestionChips.map((chip, i) => <button key={i} onClick={() => handleSend(chip)} className="text-xs px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-kubemind-purple-300 border border-gray-700 transition-colors">{chip}</button>)}</div>}
        <form onSubmit={(e) => {e.preventDefault(); handleSend(input)}} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Command your cloud..." className="flex-1 bg-gray-900 border-gray-700 focus:ring-kubemind-purple-500" disabled={isThinking}/>
          <Button type="submit" disabled={!input.trim() || isThinking} className="bg-kubemind-purple-600 hover:bg-kubemind-purple-700">{isThinking ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}</Button>
        </form>
      </div>
    </div>
  )
}
