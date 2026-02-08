export type CloudProvider = 'aws' | 'azure' | 'gcp'

export interface CloudAccount {
  id: string
  provider: CloudProvider
  displayName: string
  email?: string
  connectedAt: string
  status: 'active' | 'disconnected' | 'error'
}

export interface Resource {
  id: string
  name: string
  type: string
  provider: CloudProvider
  region: string
  status: 'running' | 'stopped' | 'error' | 'creating' | 'deleting'
  createdAt: string
  tags?: Record<string, string>
  cost?: number
}

export interface UnifiedResource extends Resource {
  category: 'compute' | 'storage' | 'database' | 'network' | 'other'
}
