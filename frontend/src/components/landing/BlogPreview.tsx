import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const posts = [
  {
    title: 'Introducing June AI: The Future of Cloud Ops',
    date: 'Feb 01, 2026',
    excerpt: 'How we built an autonomous agent that can safely manage production Kubernetes clusters.',
    category: 'Product'
  },
  {
    title: 'Reducing AWS Spend by 40% with Spot Instances',
    date: 'Jan 28, 2026',
    excerpt: 'A deep dive into spot instance strategies and how to handle interruptions gracefully.',
    category: 'Engineering'
  },
  {
    title: 'Zero-Trust Security for Remote Teams',
    date: 'Jan 15, 2026',
    excerpt: 'Why VPNs are becoming obsolete and how identity-based access is taking over.',
    category: 'Security'
  }
]

export default function BlogPreview() {
  return (
    <div id="blog" className="py-24 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Latest Updates</h2>
            <p className="mt-2 text-gray-400">Insights from the Kubemind team</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex">
            View all posts <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.title} className="group cursor-pointer">
              <div className="mb-4">
                <span className="text-xs font-semibold text-kubemind-purple-400 uppercase tracking-wide">
                  {post.category}
                </span>
                <span className="text-gray-600 mx-2">•</span>
                <span className="text-xs text-gray-500">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-kubemind-purple-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 sm:hidden">
          <Button variant="ghost" className="w-full justify-center">
            View all posts <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
