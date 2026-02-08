export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  thinking?: boolean
}

export interface SuggestionChip {
  id: string
  text: string
  category: 'infrastructure' | 'cost' | 'security' | 'general'
}
