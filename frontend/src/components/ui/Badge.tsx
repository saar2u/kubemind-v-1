import React from 'react'
export const Badge = ({ children, variant = "default" }: any) => {
  const colors: any = {
    default: "bg-gray-800 text-gray-300",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20"
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${colors[variant]}`}>{children}</span>
}
