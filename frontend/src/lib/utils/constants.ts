export const APP_NAME = 'Kubemind'
export const APP_VERSION = '1.0.0'
export const APP_TAGLINE = 'Your cloud co-pilot — zero keys stored'

export const CLOUD_PROVIDERS = {
  AWS: 'aws',
  AZURE: 'azure',
  GCP: 'gcp'
} as const

export const RESOURCE_CATEGORIES = {
  COMPUTE: 'compute',
  STORAGE: 'storage',
  DATABASE: 'database',
  NETWORK: 'network',
  OTHER: 'other'
} as const

export const MESSAGE_ROLES = {
  USER: 'user' as const,
  ASSISTANT: 'assistant' as const
}

export const RATE_LIMIT = {
  MAX_REQUESTS: 5,
  WINDOW_SECONDS: 60
}

export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  HEALTH: '/health'
}

export const STORAGE_KEYS = {
  CHAT_HISTORY: 'kubemind-chat-history',
  ACCOUNT: 'kubemind-account',
  UI_STATE: 'kubemind-ui-state'
}

export const COLORS = {
  PRIMARY: '#6366f1',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6'
}
