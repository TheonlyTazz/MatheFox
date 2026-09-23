import { onMounted, onUnmounted, ref, type Ref } from 'vue'

const unsupportedMessage =
  'Die Vorlesefunktion wird von diesem Browser nicht unterstützt. Bitte verwende einen aktuellen Browser mit aktivierter Sprachausgabe.'

export const primeSpeechVoices = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.getVoices()
}

/**
 * Provides the browser's native German speech synthesis for an exercise.
 *
 * Speech synthesis is looked up lazily so this composable can also be used
 * while rendering on the server.
 */
export function useSpeech(): {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<string | null>
} {
  const isSpeaking = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let synthesis: SpeechSynthesis | null = null
  let deVoice: SpeechSynthesisVoice | null = null
  let activeUtterance: SpeechSynthesisUtterance | null = null
  let pendingText: string | null = null
  let pendingTimeout: number | null = null

  const getSynthesis = (): SpeechSynthesis | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }

    synthesis ??= window.speechSynthesis
    return synthesis
  }

  const chooseGermanVoice = (): void => {
    if (!synthesis) {
      return
    }

    const voices = synthesis.getVoices()
    const germanVoices = voices.filter((voice) => voice.localService && voice.lang.toLowerCase().startsWith('de'))

    deVoice =
      germanVoices.find((voice) => /natural|premium|enhanced/i.test(voice.name)) ??
      germanVoices.find((voice) => voice.lang.toLowerCase() === 'de-de') ??
      germanVoices[0] ??
      null
  }

  const handleVoicesChanged = (): void => {
    chooseGermanVoice()
    if (pendingText !== null) {
      const text = pendingText
      pendingText = null
      if (pendingTimeout !== null) window.clearTimeout(pendingTimeout)
      pendingTimeout = null
      isLoading.value = false
      if (deVoice === null) {
        error.value = 'Keine lokale deutsche Stimme verfügbar. Bitte installiere eine deutsche Systemstimme.'
        return
      }
      speak(text)
    }
  }

  const stop = (): void => {
    const shouldCancel = activeUtterance !== null
    activeUtterance = null
    isSpeaking.value = false
    isLoading.value = false
    pendingText = null
    if (pendingTimeout !== null) window.clearTimeout(pendingTimeout)
    pendingTimeout = null
    if (shouldCancel) getSynthesis()?.cancel()
  }

  const speak = (text: string): void => {
    const phrase = text.trim()
    if (!phrase) {
      throw new Error('Vorlesetext darf nicht leer sein.')
    }

    const currentSynthesis = getSynthesis()
    if (!currentSynthesis) {
      throw new Error(unsupportedMessage)
    }

    chooseGermanVoice()
    error.value = null
    if (deVoice === null && currentSynthesis.getVoices().length === 0) {
      pendingText = phrase
      isLoading.value = true
      if (pendingTimeout !== null) window.clearTimeout(pendingTimeout)
      pendingTimeout = window.setTimeout(() => {
        pendingText = null
        pendingTimeout = null
        isLoading.value = false
        error.value = 'Keine lokale deutsche Stimme geladen. Bitte installiere eine deutsche Systemstimme.'
      }, 5000)
      return
    }
    if (deVoice === null) throw new Error('Keine lokale deutsche Stimme verfügbar. Bitte installiere eine deutsche Systemstimme für die Offline-Vorlesefunktion.')
    pendingText = null
    if (pendingTimeout !== null) window.clearTimeout(pendingTimeout)
    pendingTimeout = null
    isLoading.value = false
    if (activeUtterance !== null || currentSynthesis.speaking || currentSynthesis.pending) currentSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(phrase)
    utterance.lang = 'de-DE'
    utterance.pitch = 1
    utterance.rate = 1
    utterance.voice = deVoice

    activeUtterance = utterance
    isSpeaking.value = false

    utterance.onstart = (): void => {
      if (activeUtterance === utterance) {
        isSpeaking.value = true
      }
    }
    utterance.onend = (): void => {
      if (activeUtterance === utterance) {
        activeUtterance = null
        isSpeaking.value = false
      }
    }
    utterance.onerror = (event): void => {
      if (activeUtterance === utterance) {
        activeUtterance = null
        isSpeaking.value = false
        error.value = `Vorlesen fehlgeschlagen: ${event.error}`
      }
    }

    currentSynthesis.speak(utterance)
  }

  onMounted(() => {
    const currentSynthesis = getSynthesis()
    if (currentSynthesis) {
      chooseGermanVoice()
      currentSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
    }
  })

  onUnmounted(() => {
    if (pendingTimeout !== null) window.clearTimeout(pendingTimeout)
    if (synthesis) {
      synthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      if (activeUtterance !== null) synthesis.cancel()
    }
    activeUtterance = null
    isSpeaking.value = false
    isLoading.value = false
  })

  return { speak, stop, isSpeaking, isLoading, error }
}
