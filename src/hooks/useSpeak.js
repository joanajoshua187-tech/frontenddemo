import { useCallback } from 'react'
import { useToast } from './useToast'

const LOCALES = { en: 'en-US', sw: 'sw-TZ' }

export function useSpeak() {
  const notify = useToast()
  return useCallback(
    (text, lang = 'en') => {
      try {
        if (!('speechSynthesis' in window)) throw new Error('unsupported')
        const u = new SpeechSynthesisUtterance(text)
        u.lang = LOCALES[lang] ?? 'en-US'
        u.rate = 0.95
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(u)
      } catch {
        notify('Reading aloud does not work in this browser. Try Chrome or Edge.', 'warn')
      }
    },
    [notify],
  )
}
