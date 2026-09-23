import { ref, type Ref } from 'vue'

type SpeechResponse =
  | { id: number; type: 'status'; installed: boolean }
  | { id: number; type: 'ready' }
  | { id: number; type: 'audio'; blob: Blob }
  | { id: number; type: 'progress'; loaded: number; total: number }
  | { id: number; type: 'error'; message: string }

type SpeechRequest =
  | { id: number; type: 'status' }
  | { id: number; type: 'prepare' }
  | { id: number; type: 'synthesize'; text: string }

type SpeechRequestInput =
  | { type: 'status' }
  | { type: 'prepare' }
  | { type: 'synthesize'; text: string }

type PendingRequest = {
  resolve: (response: SpeechResponse) => void
  reject: (error: Error) => void
}

const isInstalled = ref(false)
const isChecking = ref(false)
const isLoading = ref(false)
const isSpeaking = ref(false)
const downloadLoaded = ref(0)
const downloadTotal = ref(0)
const error = ref<string | null>(null)

let worker: Worker | null = null
let nextRequestId = 1
let preparation: Promise<void> | null = null
let installationCheck: Promise<boolean> | null = null
let audio: HTMLAudioElement | null = null
let audioUrl: string | null = null
let speechSequence = 0
const requests = new Map<number, PendingRequest>()

const getWorker = (): Worker => {
  if (typeof Worker === 'undefined' || !navigator.storage || typeof navigator.storage.getDirectory !== 'function') {
    throw new Error('Diese Offline-Stimme benötigt einen aktuellen Browser mit lokalem Speicher.')
  }
  if (worker === null) {
    worker = new Worker(new URL('../workers/speech.worker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (event: MessageEvent<SpeechResponse>) => {
      const response = event.data
      if (response.type === 'progress') {
        downloadLoaded.value = response.loaded
        downloadTotal.value = response.total
        return
      }
      const pending = requests.get(response.id)
      if (!pending) throw new Error(`Unexpected speech response: ${response.id}`)
      requests.delete(response.id)
      if (response.type === 'error') pending.reject(new Error(response.message))
      else pending.resolve(response)
    })
    worker.addEventListener('error', (event: ErrorEvent) => {
      const failure = new Error(`Offline-Stimme konnte nicht gestartet werden: ${event.message}`)
      for (const pending of requests.values()) pending.reject(failure)
      requests.clear()
      worker?.terminate()
      worker = null
      error.value = failure.message
    })
  }
  return worker
}

const request = (message: SpeechRequestInput): Promise<SpeechResponse> => {
  const id = nextRequestId++
  return new Promise<SpeechResponse>((resolve, reject) => {
    requests.set(id, { resolve, reject })
    try {
      getWorker().postMessage({ ...message, id } satisfies SpeechRequest)
    } catch (failure) {
      requests.delete(id)
      reject(failure instanceof Error ? failure : new Error(String(failure)))
    }
  })
}

const checkInstalled = (): Promise<boolean> => {
  if (isInstalled.value) return Promise.resolve(true)
  if (installationCheck !== null) return installationCheck
  isChecking.value = true
  installationCheck = request({ type: 'status' }).then((response) => {
    if (response.type !== 'status') throw new Error(`Unexpected speech status: ${response.type}`)
    isInstalled.value ||= response.installed
    return isInstalled.value
  }).catch((failure: unknown) => {
    error.value = failure instanceof Error ? failure.message : String(failure)
    throw failure
  }).finally(() => {
    isChecking.value = false
    installationCheck = null
  })
  return installationCheck
}

const prepareVoice = (): Promise<void> => {
  if (preparation !== null) return preparation
  error.value = null
  isLoading.value = true
  downloadLoaded.value = 0
  downloadTotal.value = 0
  preparation = request({ type: 'prepare' }).then((response) => {
    if (response.type !== 'ready') throw new Error(`Unexpected speech preparation: ${response.type}`)
    isInstalled.value = true
  }).catch((failure: unknown) => {
    error.value = failure instanceof Error ? failure.message : String(failure)
    throw failure
  }).finally(() => {
    isLoading.value = false
    preparation = null
  })
  return preparation
}

const stopPlayback = (): void => {
  if (audio !== null) {
    audio.onended = null
    audio.onerror = null
    audio.pause()
    audio.src = ''
    audio = null
  }
  if (audioUrl !== null) {
    URL.revokeObjectURL(audioUrl)
    audioUrl = null
  }
  isSpeaking.value = false
}

const stop = (): void => {
  speechSequence += 1
  stopPlayback()
  isLoading.value = preparation !== null
}

const speak = async (text: string): Promise<void> => {
  const phrase = text.trim()
  if (!phrase) throw new Error('Vorlesetext darf nicht leer sein.')
  if (!isInstalled.value && !(await checkInstalled())) {
    throw new Error('Bitte lade zuerst die kostenlose Offline-Stimme Ramona.')
  }
  const sequence = ++speechSequence
  stopPlayback()
  isLoading.value = true
  error.value = null
  try {
    await prepareVoice()
    if (sequence !== speechSequence) return
    isLoading.value = true
    const response = await request({ type: 'synthesize', text: phrase })
    if (response.type !== 'audio') throw new Error(`Unexpected speech audio: ${response.type}`)
    if (sequence !== speechSequence) return
    audioUrl = URL.createObjectURL(response.blob)
    audio = new Audio(audioUrl)
    audio.onended = () => { if (sequence === speechSequence) stopPlayback() }
    audio.onerror = () => {
      if (sequence === speechSequence) {
        error.value = 'Die erzeugte Sprachausgabe konnte nicht abgespielt werden.'
        stopPlayback()
      }
    }
    await audio.play()
    if (sequence === speechSequence) isSpeaking.value = true
  } catch (failure) {
    if (sequence === speechSequence) {
      error.value = failure instanceof Error ? failure.message : String(failure)
      stopPlayback()
    }
    throw failure
  } finally {
    if (sequence === speechSequence) isLoading.value = false
  }
}

export function useSpeech(): {
  speak: (text: string) => Promise<void>
  stop: () => void
  checkInstalled: () => Promise<boolean>
  prepareVoice: () => Promise<void>
  isInstalled: Ref<boolean>
  isChecking: Ref<boolean>
  isLoading: Ref<boolean>
  isSpeaking: Ref<boolean>
  downloadLoaded: Ref<number>
  downloadTotal: Ref<number>
  error: Ref<string | null>
} {
  return { speak, stop, checkInstalled, prepareVoice, isInstalled, isChecking, isLoading, isSpeaking, downloadLoaded, downloadTotal, error }
}
