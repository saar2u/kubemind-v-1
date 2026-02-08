import React from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { useAccountStore } from '@/lib/store/accountStore'
import { useNavigate } from 'react-router-dom'
import { Key, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { AwsLogo, AzureLogo, GcpLogo } from '@/components/ui/CloudLogos'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Settings() {
  const { user } = useAccountStore()
  const navigate = useNavigate()

  const handlePasswordReset = async () => {
    if (user?.email) {
      try {
        await sendPasswordResetEmail(auth, user.email)
        alert('Password reset email sent to ' + user.email)
      } catch (e: any) {
        alert('Error: ' + e.message)
      }
    }
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400">Manage your preferences and integrations</p>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><h3 className="text-lg font-semibold text-white">Security</h3></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">Password Login</p>
                    <p className="text-sm text-gray-400">Create a password for your account</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={handlePasswordReset}>Set Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">API Keys</p>
                    <p className="text-sm text-gray-400">Manage programmatic access</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => alert('API Key: sk_live_' + user?.uid.substring(0,8))}>View Keys</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><h3 className="text-lg font-semibold text-white">Cloud Integrations</h3></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4"><AwsLogo className="w-6 h-6" /><span className="font-bold">AWS</span></div>
                  <Button className="w-full" onClick={() => navigate('/connections')}>Manage <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
                <div className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4"><AzureLogo className="w-6 h-6" /><span className="font-bold">Azure</span></div>
                  <Button className="w-full" onClick={() => navigate('/connections')}>Manage <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
                <div className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4"><GcpLogo className="w-6 h-6" /><span className="font-bold">GCP</span></div>
                  <Button className="w-full" onClick={() => navigate('/connections')}>Manage <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
