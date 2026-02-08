import type { PKCEState } from '@/types/auth'

const PKCE_STORAGE_KEY = 'kubemind_pkce_state'

// Generate a random string for code verifier
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Generate code challenge from code verifier using SHA-256
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  
  // Convert to base64 URL-safe format
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Generate random state parameter
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Store PKCE state in sessionStorage
export function storePKCEState(state: PKCEState): void {
  sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(state))
}

// Retrieve PKCE state from sessionStorage
export function getPKCEState(): PKCEState | null {
  const stored = sessionStorage.getItem(PKCE_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

// Clear PKCE state
export function clearPKCEState(): void {
  sessionStorage.removeItem(PKCE_STORAGE_KEY)
}

// Validate state parameter
export function validateState(stateParam: string): boolean {
  const storedState = getPKCEState()
  return storedState?.state === stateParam
}
