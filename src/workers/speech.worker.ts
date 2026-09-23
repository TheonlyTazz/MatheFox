import { TtsSession, stored, type Progress } from '@mintplex-labs/piper-tts-web'

const voiceId = 'de_DE-ramona-low'
const assets = `${import.meta.env.BASE_URL}tts/`

type SpeechRequest =
  | { id: number; type: 'status' }
  | { id: number; type: 'prepare' }
  | { id: number; type: 'synthesize'; text: string }

type SpeechResponse =
  | { id: number; type: 'status'; installed: boolean }
  | { id: number; type: 'ready' }
  | { id: number; type: 'audio'; blob: Blob }
  | { id: number; type: 'progress'; loaded: number; total: number }
  | { id: number; type: 'error'; message: string }

let sessionPromise: Promise<TtsSession> | null = null

const send = (message: SpeechResponse): void => self.postMessage(message)

const getSession = (requestId: number): Promise<TtsSession> => {
  if (sessionPromise === null) {
    sessionPromise = TtsSession.create({
      voiceId,
      progress: (progress: Progress) => send({ id: requestId, type: 'progress', loaded: progress.loaded, total: progress.total }),
      wasmPaths: {
        onnxWasm: `${assets}ort/`,
        piperData: `${assets}piper_phonemize.data`,
        piperWasm: `${assets}piper_phonemize.wasm`,
      },
    }).catch((error: unknown) => {
      TtsSession._instance = null
      sessionPromise = null
      throw error
    })
  }
  return sessionPromise
}

const handle = async (request: SpeechRequest): Promise<void> => {
  if (!Number.isInteger(request.id) || request.id < 1) throw new Error('Invalid speech request ID')
  if (request.type === 'status') {
    const installed = (await stored()).includes(voiceId)
    send({ id: request.id, type: 'status', installed })
    return
  }
  if (request.type === 'prepare') {
    await getSession(request.id)
    if (!(await stored()).includes(voiceId)) throw new Error('Die Offline-Stimme wurde nicht vollständig gespeichert. Bitte versuche den Download erneut.')
    send({ id: request.id, type: 'ready' })
    return
  }
  if (request.type === 'synthesize') {
    if (!request.text.trim()) throw new Error('Speech text must not be empty')
    const session = await getSession(request.id)
    const blob = await session.predict(request.text)
    if (blob.size === 0) throw new Error('Speech engine returned empty audio')
    send({ id: request.id, type: 'audio', blob })
    return
  }
  throw new Error('Unknown speech request')
}

self.addEventListener('message', (event: MessageEvent<SpeechRequest>) => {
  void handle(event.data).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    send({ id: event.data.id, type: 'error', message })
  })
})
