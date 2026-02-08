import React from 'react'

const cases = [
  {
    role: 'DevOps Engineers',
    title: 'Automated Incident Response',
    description: 'Wake up to solutions, not alerts. Kubemind identifies the root cause of server outages and suggests the exact kubectl command to fix it.',
    quote: '"Kubemind cut our MTTR by 60% in the first week."'
  },
  {
    role: 'CFOs & Finance',
    title: 'Cloud Bill Transparency',
    description: 'Stop paying for "Zombie" servers. Identify development environments running on weekends and unattached storage volumes instantly.',
    quote: '"Finally, a cloud bill I can actually understand."'
  },
  {
    role: 'Security Teams',
    title: 'Compliance Guardrails',
    description: 'Ensure SOC 2 compliance automatically. Kubemind continuously scans for public S3 buckets and weak security groups.',
    quote: '"It\'s like having a security analyst working 24/7."'
  }
]

export default function UseCases() {
  return (
    <div id="use-cases" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white mb-12 text-center">
          Built for every stakeholder
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((useCase) => (
            <div key={useCase.title} className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
              <div className="text-sm font-semibold text-kubemind-purple-400 mb-2 uppercase tracking-wide">
                For {useCase.role}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{useCase.title}</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                {useCase.description}
              </p>
              <div className="pt-6 border-t border-gray-800">
                <p className="italic text-gray-500">{useCase.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
