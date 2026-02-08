import axios from 'axios'

// Ensure this matches your deployment URL exactly
const API_BASE_URL = 'https://kubemind-api-446293329392.us-central1.run.app'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // In a real app, this comes from auth. For MVP, we use the user's email or 'default_user'
    'x-user-id': localStorage.getItem('kubemind-user-email') || 'default_user'
  },
})

// Update header dynamically (e.g. after login)
apiClient.interceptors.request.use((config) => {
    const userEmail = localStorage.getItem('kubemind-user-email')
    if (userEmail) {
        config.headers['x-user-id'] = userEmail
    }
    return config
})

export interface ChatResponse { response: string; suggestions: string[] }
export interface Resource { id: string; name: string; type: string; provider: 'aws' | 'azure' | 'gcp'; region: string; status: string; cost: number }

export const api = {
  chat: async (message: string, context?: string) => {
    const response = await apiClient.post<ChatResponse>('/api/chat', { message, context });
    return response.data;
  },
  
  getResources: async () => {
    const response = await apiClient.get<Resource[]>('/api/resources');
    return response.data; 
  },
  
  connectAWS: async (creds: any) => {
    const response = await apiClient.post('/api/connect/aws', creds);
    return response.data;
  },
  
  // Re-add Azure/GCP connect methods similarly...
  connectAzure: async (creds: any) => { return (await apiClient.post('/api/connect/azure', creds)).data },
  connectGCP: async (creds: any) => { return (await apiClient.post('/api/connect/gcp', creds)).data },

  disconnect: async (provider: string) => {
    const response = await apiClient.delete(`/api/connect/${provider}`);
    return response.data;
  },
  
  // NEW: Nuke Account
  deleteAccountPermanently: async () => {
      const response = await apiClient.delete('/api/nuke_user');
      return response.data;
  }
}
