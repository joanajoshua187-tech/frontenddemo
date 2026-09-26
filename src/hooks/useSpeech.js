import { useCallback, useEffect, useRef, useState } from 'react'

const LOCALES = { en: 'en-US', sw: 'sw-TZ' }

function getRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeech(lang) {
  const Recognition = getRecognition()
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => () => recognitionRef.current?.abort(), [])

  const listen = useCallback(
    (onText) => {
      if (!Recognition) {
        setError('Voice input does not work in this browser. Type your question instead, or use Chrome or Edge.')
        return
      }
      setError('')
      const recognition = new Recognition()
      recognition.lang = LOCALES[lang]
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript ?? ''
        if (text) onText(text)
      }
      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('The microphone is blocked. Allow microphone access in your browser, or type your question.')
        } else if (event.error === 'no-speech') {
          setError('I did not hear anything. Tap the microphone and try again.')
        } else if (event.error === 'language-not-supported') {
          setError('This browser cannot listen in that language. Switch language or type your question.')
        } else {
          setError('Voice input stopped. Try again or type your question.')
        }
      }
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
      try {
        recognition.start()
        setListening(true)
      } catch {
        setError('Voice input could not start. Type your question instead.')
      }
    },
    [Recognition, lang],
  )

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const speak = useCallback(
    (text) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = LOCALES[lang]
        const voice = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith(lang))
        if (voice) utterance.voice = voice
        utterance.rate = 0.95
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      } catch {
        setError('')
      }
    },
    [lang],
  )

  const silence = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  return { supported: Boolean(Recognition), listening, error, listen, stop, speak, silence }
}
