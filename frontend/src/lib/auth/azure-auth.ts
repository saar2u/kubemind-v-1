import { PublicClientApplication } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || '',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile']
}

export async function initiateAzureAuth(): Promise<void> {
  try {
    await msalInstance.loginPopup(loginRequest)
  } catch (error) {
    console.error('Azure auth error:', error)
    throw error
  }
}

export function getAzureAccount() {
  const accounts = msalInstance.getAllAccounts()
  return accounts[0]
}
