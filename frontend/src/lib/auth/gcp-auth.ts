import { generateCodeVerifier, generateCodeChallenge, storePKCEState } from './oauth-helpers'

const GCP_CLIENT_ID = import.meta.env.VITE_GCP_CLIENT_ID
const REDIRECT_URI = window.location.origin + '/auth/callback'

export async function initiateGCPAuth(): Promise<void> {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = Math.random().toString(36).substring(2, 15)
  
  storePKCEState({
    codeVerifier,
    codeChallenge,
    state,
    timestamp: Date.now()
  })
  
  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
    `client_id=${GCP_CLIENT_ID}&` +
    `response_type=code&` +
    `scope=openid+email+profile+https://www.googleapis.com/auth/cloud-platform&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `state=${state}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256&` +
    `access_type=offline`
  
  window.location.href = authUrl
}

export async function handleGCPCallback(code: string, state: string): Promise<void> {
  // Exchange code for tokens
  // This would call your backend to complete the OAuth flow
  console.log('GCP OAuth callback with code:', code, 'state:', state)
}
