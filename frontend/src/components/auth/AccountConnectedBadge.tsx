import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { AwsLogo, AzureLogo, GcpLogo } from '@/components/ui/CloudLogos'

interface AccountConnectedBadgeProps {
  provider: 'aws' | 'azure' | 'gcp'
  status: 'active' | 'disconnected' | 'error'
}

export default function AccountConnectedBadge({ provider, status }: AccountConnectedBadgeProps) {
  const getLogo = () => {
    switch (provider) {
      case 'aws': return <AwsLogo className="w-4 h-4 mr-2" />
      case 'azure': return <AzureLogo className="w-4 h-4 mr-2" />
      case 'gcp': return <GcpLogo className="w-4 h-4 mr-2" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'success'
      case 'disconnected': return 'warning'
      case 'error': return 'danger'
    }
  }

  return (
    <Badge variant={getStatusColor()}>
      {getLogo()}
      {provider.toUpperCase()} {status === 'active' ? 'Connected' : status}
    </Badge>
  )
}
