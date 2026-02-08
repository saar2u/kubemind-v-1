import React, { useEffect, useState } from 'react'
import { useAccountStore } from '@/lib/store/accountStore'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Cloud, DollarSign, Activity, Server, AlertCircle, RefreshCw } from 'lucide-react'
import { AwsLogo, AzureLogo, GcpLogo } from '@/components/ui/CloudLogos'
import { api, Resource } from '@/lib/api/client'
import { Button } from '@/components/ui/Button'

export default function Dashboard() {
  const { user, connectedAccounts } = useAccountStore()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const res = await api.getResources() 
      setResources(res)
    } catch (e) {
      console.error("Fetch error", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const stats = [
    { name: 'Total Resources', value: resources.length.toString(), icon: Server },
    { name: 'Active Resources', value: resources.filter(r => r.status === 'running').length.toString(), icon: Activity },
    { name: 'Monthly Cost', value: '$0.00', icon: DollarSign },
    { name: 'Connected Clouds', value: connectedAccounts.length.toString(), icon: Cloud },
  ]

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-gray-400">Welcome, {user?.name}</p></div>
            <Button onClick={fetchData} variant="secondary" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div><p className="text-sm text-gray-400">{stat.name}</p><p className="text-2xl font-bold mt-1">{stat.value}</p></div>
                    <div className="p-3 bg-gray-800 rounded-lg"><stat.icon className="w-5 h-5 text-kubemind-purple-400" /></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><CardTitle>Live Resources</CardTitle></CardHeader>
            <CardContent>
              {loading && !refreshing ? <p className="text-center py-8 text-gray-500">Loading...</p> : resources.length === 0 ? <p className="text-center py-8 text-gray-500">No resources found.</p> : (
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-gray-800 text-gray-400"><th className="pb-3 pl-4">Name/ID</th><th className="pb-3">Type</th><th className="pb-3">Region</th><th className="pb-3">Status</th><th className="pb-3">Provider</th></tr></thead>
                  <tbody className="divide-y divide-gray-800">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-800/50">
                        <td className="py-4 pl-4"><div>{res.name}</div><div className="text-xs text-gray-500 font-mono">{res.id}</div></td>
                        <td className="py-4 text-gray-300">{res.type}</td>
                        <td className="py-4 text-gray-300">{res.region}</td>
                        <td className="py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${res.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>{res.status}</span></td>
                        <td className="py-4">{res.provider === 'aws' ? <AwsLogo className="w-5 h-5"/> : <Cloud className="w-5 h-5"/>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
