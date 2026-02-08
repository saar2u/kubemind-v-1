import { CloudProvider } from './cloud'

export interface InventorySummary {
  totalResources: number
  computeCount: number
  storageCount: number
  databaseCount: number
  networkCount: number
  totalCost?: number
  lastScanned: string
}

export interface ResourceFilter {
  provider?: CloudProvider
  category?: string
  status?: string
  region?: string
  search?: string
}
