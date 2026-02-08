import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatState {
  messages: Message[]
  isThinking: boolean
  suggestionChips: string[]
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant') => void
  addAssistantMessage: (content: string) => void
  setThinking: (thinking: boolean) => void
  setSuggestionChips: (chips: string[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isThinking: false,
      suggestionChips: [],

      addMessage: (content, role) => set((state) => ({
        messages: [...state.messages, {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date().toISOString()
        }]
      })),

      addAssistantMessage: (content) => set((state) => ({
        messages: [...state.messages, {
          id: Date.now().toString(),
          role: 'assistant',
          content,
          timestamp: new Date().toISOString()
        }]
      })),

      setThinking: (thinking) => set({ isThinking: thinking }),
      
      setSuggestionChips: (chips) => set({ suggestionChips: chips }),

      clearMessages: () => set({ messages: [], suggestionChips: [] })
    }),
    {
      name: 'kubemind-chat-storage'
    }
  )
)
