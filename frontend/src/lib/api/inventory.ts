// Mock API functions - would connect to real backend in production

export interface InventoryResponse {
  resources: any[]
  summary: any
}

export async function fetchInventory(): Promise<InventoryResponse> {
  // In production, this would call the real API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        resources: [],
        summary: {}
      })
    }, 500)
  })
}
