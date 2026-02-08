import React, { useState } from 'react'
import { useAccountStore } from '@/lib/store/accountStore'
import { useUIStore } from '@/lib/store/uiStore'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AwsLogo, AzureLogo, GcpLogo } from '@/components/ui/CloudLogos'
import { Key, Server, Trash2, Edit2, RotateCw, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api/client'

type Provider = 'aws' | 'azure' | 'gcp'

export default function ConnectionsPage() {
  const { connectedAccounts, addConnectedAccount, removeConnectedAccount } = useAccountStore()
  const { addToast } = useUIStore()
  const [activeTab, setActiveTab] = useState<Provider>('aws')
  const [isLoading, setIsLoading] = useState(false)
  
  // Credentials
  const [awsAccessKey, setAwsAccessKey] = useState(''); const [awsSecretKey, setAwsSecretKey] = useState(''); const [awsRegion, setAwsRegion] = useState('us-east-1')
  const [azureSubId, setAzureSubId] = useState(''); const [azureTenantId, setAzureTenantId] = useState(''); const [azureClientId, setAzureClientId] = useState(''); const [azureClientSecret, setAzureClientSecret] = useState('')
  const [gcpProjectId, setGcpProjectId] = useState(''); const [gcpJson, setGcpJson] = useState('')

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'aws') {
        if(!awsAccessKey || !awsSecretKey) throw new Error("Missing AWS keys")
        await api.connectAWS({ access_key: awsAccessKey, secret_key: awsSecretKey, region: awsRegion })
        addConnectedAccount({ id: 'aws', provider: 'aws', displayName: `AWS (${awsRegion})`, connectedAt: new Date().toISOString(), status: 'active' })
        setAwsSecretKey('')
      } else if (activeTab === 'azure') {
        if(!azureClientId) throw new Error("Missing Azure keys")
        await api.connectAzure({ subscription_id: azureSubId, tenant_id: azureTenantId, client_id: azureClientId, client_secret: azureClientSecret })
        addConnectedAccount({ id: 'azure', provider: 'azure', displayName: `Azure (${azureSubId.slice(0,6)}...)`, connectedAt: new Date().toISOString(), status: 'active' })
      } else if (activeTab === 'gcp') {
        if(!gcpJson) throw new Error("Missing GCP JSON")
        await api.connectGCP({ project_id: gcpProjectId, service_account_json: gcpJson })
        addConnectedAccount({ id: 'gcp', provider: 'gcp', displayName: `GCP (${gcpProjectId})`, connectedAt: new Date().toISOString(), status: 'active' })
      }
      addToast({ message: `Connected to ${activeTab.toUpperCase()}`, type: 'success' })
    } catch (error: any) {
      alert("Connection Failed: " + error.message)
    } finally { setIsLoading(false) }
  }

  const handleDisconnect = async (p: string) => {
    if(confirm(`Disconnect ${p.toUpperCase()}? This will remove keys from the Agent.`)) {
      try {
        await api.disconnect(p) // Call Backend to wipe keys
        removeConnectedAccount(p) // Update UI
        addToast({ message: "Disconnected", type: 'info' })
      } catch(e) { console.error(e) }
    }
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex justify-between items-center">
             <div><h1 className="text-3xl font-bold flex items-center gap-3"><Server className="w-8 h-8 text-kubemind-purple-400" /> Connections</h1><p className="text-gray-400 mt-1">Connect your clouds to enable the AI Agent.</p></div>
          </div>

          {/* ADD NEW CONNECTION SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6 flex gap-2 items-center"><Key className="w-5 h-5 text-kubemind-purple-400" /> Add New Connection</h2>
            
            <div className="flex gap-4 mb-6 border-b border-gray-800 pb-4">
              {(['aws', 'azure', 'gcp'] as Provider[]).map(p => (
                <button key={p} onClick={() => setActiveTab(p)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === p ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                   {p==='aws' && <AwsLogo className="w-5 h-5"/>}{p==='azure' && <AzureLogo className="w-5 h-5"/>}{p==='gcp' && <GcpLogo className="w-5 h-5"/>} {p.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="max-w-2xl">
              {activeTab === 'aws' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 uppercase">Access Key ID</label><Input value={awsAccessKey} onChange={e => setAwsAccessKey(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                    <div><label className="text-xs text-gray-500 uppercase">Region</label><Input value={awsRegion} onChange={e => setAwsRegion(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500 uppercase">Secret Access Key</label><Input type="password" value={awsSecretKey} onChange={e => setAwsSecretKey(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                </div>
              )}
              {activeTab === 'azure' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="text-xs text-gray-500 uppercase">Subscription ID</label><Input value={azureSubId} onChange={e => setAzureSubId(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                     <div><label className="text-xs text-gray-500 uppercase">Tenant ID</label><Input value={azureTenantId} onChange={e => setAzureTenantId(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="text-xs text-gray-500 uppercase">Client ID</label><Input value={azureClientId} onChange={e => setAzureClientId(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                     <div><label className="text-xs text-gray-500 uppercase">Client Secret</label><Input type="password" value={azureClientSecret} onChange={e => setAzureClientSecret(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                  </div>
                </div>
              )}
              {activeTab === 'gcp' && (
                <div className="space-y-4">
                   <div><label className="text-xs text-gray-500 uppercase">Project ID</label><Input value={gcpProjectId} onChange={e => setGcpProjectId(e.target.value)} className="bg-gray-950 border-gray-800" /></div>
                   <div><label className="text-xs text-gray-500 uppercase">Service Account JSON</label><textarea rows={4} value={gcpJson} onChange={e => setGcpJson(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md p-3 text-sm font-mono text-white" placeholder="{...}" /></div>
                </div>
              )}
              <Button onClick={handleConnect} disabled={isLoading} className="mt-6 w-full h-12 bg-kubemind-purple-600 hover:bg-kubemind-purple-700 font-bold">
                 {isLoading ? <RotateCw className="w-5 h-5 animate-spin" /> : `Save & Connect ${activeTab.toUpperCase()}`}
              </Button>
            </div>
          </div>

          {/* ACTIVE CONNECTIONS LIST */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex gap-2 items-center"><ShieldCheck className="w-5 h-5 text-green-400" /> Active Connections</h2>
            {connectedAccounts.length === 0 ? (
               <div className="text-gray-500 italic p-8 border border-dashed border-gray-800 rounded-xl text-center">No active cloud connections. Add one above.</div>
            ) : (
              <div className="grid gap-4">
                {connectedAccounts.map((acc) => (
                  <div key={acc.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center justify-between group hover:border-gray-700 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        {acc.provider === 'aws' && <AwsLogo className="w-8 h-8"/>}
                        {acc.provider === 'azure' && <AzureLogo className="w-8 h-8"/>}
                        {acc.provider === 'gcp' && <GcpLogo className="w-8 h-8"/>}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{acc.displayName}</h3>
                        <p className="text-sm text-gray-400">Connected: {new Date(acc.connectedAt || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="secondary" onClick={() => { setActiveTab(acc.provider as Provider); window.scrollTo({top:0, behavior:'smooth'}); alert("Edit keys in the form above and click Save."); }} className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4"/> Update Keys
                      </Button>
                      <Button variant="ghost" onClick={() => handleDisconnect(acc.provider)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-2">
                        <Trash2 className="w-4 h-4"/> Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
