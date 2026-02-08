import { generateCodeVerifier, generateCodeChallenge, storePKCEState } from './oauth-helpers'

const AWS_COGNITO_CLIENT_ID = import.meta.env.VITE_AWS_COGNITO_CLIENT_ID
const AWS_COGNITO_DOMAIN = 'your-cognito-domain.auth.us-east-1.amazoncognito.com'
const REDIRECT_URI = window.location.origin + '/auth/callback'

export async function initiateAWSAuth(): Promise<void> {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = Math.random().toString(36).substring(2, 15)
  
  storePKCEState({
    codeVerifier,
    codeChallenge,
    state,
    timestamp: Date.now()
  })
  
  const authUrl = `https://${AWS_COGNITO_DOMAIN}/oauth2/authorize?` +
    `client_id=${AWS_COGNITO_CLIENT_ID}&` +
    `response_type=code&` +
    `scope=openid+profile+aws.cognito.signin.user.admin&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `state=${state}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`
  
  window.location.href = authUrl
}

export async function handleAWSCallback(code: string, state: string): Promise<void> {
  // Exchange code for tokens
  // This would call your backend to complete the OAuth flow
  console.log('AWS OAuth callback with code:', code, 'state:', state)
}
