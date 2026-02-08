import React from 'react'
import { SuggestionChip } from '@/types/chat'
import { Button } from '@/components/ui/Button'

export default function SuggestionChips({
  suggestions,
  onClick
}: {
  suggestions: SuggestionChip[]
  onClick: (suggestion: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          variant="secondary"
          size="sm"
          onClick={() => onClick(suggestion.text)}
          className="rounded-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white transition-colors"
        >
          {suggestion.text}
        </Button>
      ))}
    </div>
  )
}
