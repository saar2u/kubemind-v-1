import React from 'react'
import { Button } from '@/components/ui/Button'
import { AwsLogo, AzureLogo, GcpLogo } from '@/components/ui/CloudLogos'

export function AWS() {
  return (
    <Button
      variant="secondary"
      className="w-full justify-start px-6 py-4 bg-aws-orange-900/20 hover:bg-aws-orange-900/30 border border-aws-orange-500/30"
      onClick={() => {
        // In production, this would call initiateAWSAuth()
        alert('AWS OAuth would be initiated here')
      }}
    >
      <AwsLogo className="w-6 h-6 mr-3" />
      <span className="font-medium">Connect AWS Account</span>
    </Button>
  )
}

export function Azure() {
  return (
    <Button
      variant="secondary"
      className="w-full justify-start px-6 py-4 bg-azure-blue-900/20 hover:bg-azure-blue-900/30 border border-azure-blue-500/30"
      onClick={() => {
        // In production, this would call initiateAzureAuth()
        alert('Azure OAuth would be initiated here')
      }}
    >
      <AzureLogo className="w-6 h-6 mr-3" />
      <span className="font-medium">Connect Azure Account</span>
    </Button>
  )
}

export function GCP() {
  return (
    <Button
      variant="secondary"
      className="w-full justify-start px-6 py-4 bg-gcp-blue-900/20 hover:bg-gcp-blue-900/30 border border-gcp-blue-500/30"
      onClick={() => {
        // In production, this would call initiateGCPAuth()
        alert('GCP OAuth would be initiated here')
      }}
    >
      <GcpLogo className="w-6 h-6 mr-3" />
      <span className="font-medium">Connect GCP Account</span>
    </Button>
  )
}
