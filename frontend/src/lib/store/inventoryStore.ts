import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, Resource } from '@/lib/api/client'

interface InventoryState {
  resources: Resource[]
  loading: boolean
  lastUpdated: string | null
  
  // Actions
  setResources: (resources: Resource[]) => void
  fetchResources: () => Promise<void>
}

export const useInventoryStore = create<InventoryState>()(persist((set) => ({
  resources: [],
  loading: false,
  lastUpdated: null,

  setResources: (resources) => set({ 
    resources, 
    lastUpdated: new Date().toISOString() 
  }),

  fetchResources: async () => {
    set({ loading: true })
    try {
      const resources = await api.getResources()
      set({ resources, loading: false, lastUpdated: new Date().toISOString() })
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      set({ loading: false })
    }
  }
}), { name: 'kubemind-inventory' }))
