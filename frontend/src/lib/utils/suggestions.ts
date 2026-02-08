import type { SuggestionChip } from '@/types/chat'

export function generateSuggestionChips(response: string): SuggestionChip[] {
  const suggestions: SuggestionChip[] = []
  
  // Common infrastructure-related suggestions
  const infrastructureChips: SuggestionChip[] = [
    { id: 's1', text: 'Show me cost optimization tips', category: 'infrastructure' },
    { id: 's2', text: 'Analyze my resource utilization', category: 'infrastructure' },
    { id: 's3', text: 'Identify underutilized resources', category: 'infrastructure' },
    { id: 's4', text: 'Suggest reserved instance purchases', category: 'infrastructure' }
  ]
  
  // Cost-related suggestions
  const costChips: SuggestionChip[] = [
    { id: 's5', text: 'Generate monthly cost report', category: 'cost' },
    { id: 's6', text: 'Compare costs across providers', category: 'cost' },
    { id: 's7', text: 'Set up budget alerts', category: 'cost' },
    { id: 's8', text: 'Find cost-saving opportunities', category: 'cost' }
  ]
  
  // Security-related suggestions
  const securityChips: SuggestionChip[] = [
    { id: 's9', text: 'Run security audit', category: 'security' },
    { id: 's10', text: 'Check IAM permissions', category: 'security' },
    { id: 's11', text: 'Identify security risks', category: 'security' },
    { id: 's12', text: 'Review compliance status', category: 'security' }
  ]
  
  // General suggestions
  const generalChips: SuggestionChip[] = [
    { id: 's13', text: 'Explain cloud concepts', category: 'general' },
    { id: 's14', text: 'Help me understand this error', category: 'general' },
    { id: 's15', text: 'Create deployment script', category: 'general' },
    { id: 's16', text: 'Generate architecture diagram', category: 'general' }
  ]
  
  // Choose suggestions based on response content
  if (response.toLowerCase().includes('cost') || response.toLowerCase().includes('price')) {
    suggestions.push(...costChips.slice(0, 3))
  } else if (response.toLowerCase().includes('security') || response.toLowerCase().includes('risk')) {
    suggestions.push(...securityChips.slice(0, 3))
  } else if (response.toLowerCase().includes('resource') || response.toLowerCase().includes('optimize')) {
    suggestions.push(...infrastructureChips.slice(0, 3))
  } else {
    suggestions.push(...generalChips.slice(0, 3))
  }
  
  return suggestions
}
