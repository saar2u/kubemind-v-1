// Mock API functions for account management

export interface ConnectAccountRequest {
  provider: 'aws' | 'azure' | 'gcp'
  credentials: any
}

export async function connectCloudAccount(
  provider: 'aws' | 'azure' | 'gcp',
  credentials: any
): Promise<void> {
  // In production, this would call the real API
  console.log('Connecting to', provider)
  return new Promise((resolve) => setTimeout(resolve, 300))
}

export async function disconnectCloudAccount(accountId: string): Promise<void> {
  // In production, this would call the real API
  console.log('Disconnecting account', accountId)
  return new Promise((resolve) => setTimeout(resolve, 300))
}
