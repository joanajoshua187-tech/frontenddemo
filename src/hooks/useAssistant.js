import { useContext } from 'react'
import { AssistantContext } from '../context/assistantContext'

export function useAssistant() {
  return useContext(AssistantContext)
}
