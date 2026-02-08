import React from 'react'
import { useAccountStore } from '@/lib/store/accountStore'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { User, Mail, Shield, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, deleteAccount } = useAccountStore()
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (confirm('⚠️ WARNING: Are you sure you want to delete your account?')) {
      if (confirm('This action cannot be undone. Confirm?')) {
        try {
          await deleteAccount()
          navigate('/') 
        } catch (e: any) {
          alert("Error: " + e.message + ". Try logging out and back in first.")
        }
      }
    }
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-kubemind-purple-600 flex items-center justify-center text-3xl font-bold">{user?.name?.charAt(0)}</div>
            <div><h1 className="text-3xl font-bold">{user?.name}</h1><p className="text-gray-400">Account Settings</p></div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><h3 className="text-xl font-semibold flex gap-2"><User className="w-5 h-5" /> Details</h3></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-gray-400 text-sm">Email</label><div className="text-white flex gap-2"><Mail className="w-4 h-4"/> {user?.email}</div></div>
            </CardContent>
          </Card>

          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-red-500 font-semibold mb-4 flex gap-2"><Shield className="w-5 h-5" /> Danger Zone</h3>
            <Button variant="ghost" onClick={handleDelete} className="w-full border border-red-900/50 hover:bg-red-900/20 text-red-400 justify-center">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account Permanently
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
