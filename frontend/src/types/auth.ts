import { CloudAccount } from './cloud'

// Re-export CloudAccount so other files can find it here
export type { CloudAccount }

export interface AuthState {
  isAuthenticated: boolean
  userId?: string
  email?: string
  connectedAccounts: CloudAccount[]
  lastLogin?: string
}

export interface OAuthConfig {
  clientId: string
  redirectUri: string
  scope: string[]
}

export interface PKCEState {
  codeVerifier: string
  codeChallenge: string
  state: string
  timestamp: number
}
