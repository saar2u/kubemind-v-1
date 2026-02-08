import React from 'react'
import { Shield, Zap, Lock, BarChart3, Cloud, BrainCircuit } from 'lucide-react'

const features = [
  {
    name: 'Zero-Knowledge Security',
    description: 'We never store your cloud credentials. All sensitive data is encrypted client-side using Sodium encryption before it ever leaves your device.',
    icon: Lock,
  },
  {
    name: 'AI-Driven Cost Optimization',
    description: 'Our AI analyzes utilization patterns to identify idle resources and suggest reserved instances, potentially saving you up to 30%.',
    icon: BarChart3,
  },
  {
    name: 'Multi-Cloud Inventory',
    description: 'View assets from AWS, Azure, and Google Cloud in a single, unified dashboard. No more tab switching.',
    icon: Cloud,
  },
  {
    name: 'Automated Security Audits',
    description: 'Instantly detect open ports, unencrypted buckets, and IAM vulnerabilities with automated compliance scanning.',
    icon: Shield,
  },
  {
    name: 'Natural Language Ops',
    description: 'Chat with your infrastructure. Ask "Why is my bill high?" or "Restart the staging server" in plain English.',
    icon: BrainCircuit,
  },
  {
    name: 'Real-time Alerts',
    description: 'Get notified instantly about budget spikes, security breaches, or deployment failures via Slack or Email.',
    icon: Zap,
  },
]

export default function Features() {
  return (
    <div id="features" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-kubemind-purple-400 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Everything you need to master the cloud
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
            Kubemind bridges the gap between complex infrastructure and simple decision-making.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-gray-900 rounded-lg px-6 pb-8 border border-gray-800 h-full hover:border-kubemind-purple-500/50 transition-colors">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-kubemind-purple-500/20 rounded-md shadow-lg border border-kubemind-purple-500/30">
                        <feature.icon className="h-6 w-6 text-kubemind-purple-400" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-white tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
