import React from 'react'
import { Link2, Cpu, CheckCircle } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      id: '01',
      title: 'Connect Your Cloud',
      description: 'Securely link your AWS, Azure, or GCP accounts using read-only roles. No permanent keys are stored.',
      icon: Link2
    },
    {
      id: '02',
      title: 'AI Analysis',
      description: 'Our engine scans your inventory, analyzing usage logs and billing data to build a resource graph.',
      icon: Cpu
    },
    {
      id: '03',
      title: 'Optimize & Secure',
      description: 'Receive actionable insights. Approve fixes for security holes or cost leaks with a single click.',
      icon: CheckCircle
    }
  ]

  return (
    <div id="how-it-works" className="py-24 bg-gray-900/30 border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            How Kubemind Works
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            From connection to optimization in minutes.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-gray-800 via-kubemind-purple-500/50 to-gray-800" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step) => (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-black border-2 border-gray-800 z-10 mb-6 group hover:border-kubemind-purple-500 transition-colors">
                  <step.icon className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 max-w-xs">{step.description}</p>
                <div className="mt-4 text-sm font-mono text-kubemind-purple-500 opacity-50">Step {step.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
