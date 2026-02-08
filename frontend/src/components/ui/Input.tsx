import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: 'input' | 'textarea'
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, as: Component = 'input', ...props }, ref) => {
    // Cast Component to any to avoid strict event handler mismatches between Input/Textarea
    const Comp = Component as any
    return (
      <Comp
        className={cn(
          "flex w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kubemind-purple-500 focus:border-transparent",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
