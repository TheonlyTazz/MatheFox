const FULLSCREEN_UNSUPPORTED_ERROR = 'Vollbild wird von diesem Browser nicht unterstützt.'
const FULLSCREEN_REQUEST_ERROR = 'Der Vollbildmodus konnte nicht gestartet werden.'
const FULLSCREEN_EXIT_ERROR = 'Der Vollbildmodus konnte nicht beendet werden.'
const FULLSCREEN_UNAVAILABLE_ERROR = 'Der Vollbildmodus ist in dieser Umgebung nicht verfügbar.'
const FULLSCREEN_NOT_ACTIVE_ERROR = 'Der Vollbildmodus ist nicht aktiv.'

const getDocument = (): Document | undefined => (
  typeof document === 'undefined' ? undefined : document
)

export const isFullscreenSupported = (): boolean => {
  const currentDocument = getDocument()
  return currentDocument?.fullscreenEnabled === true
    && typeof currentDocument.documentElement.requestFullscreen === 'function'
    && typeof currentDocument.exitFullscreen === 'function'
}

export const isFullscreen = (): boolean => {
  const currentDocument = getDocument()
  return currentDocument !== undefined && currentDocument.fullscreenElement !== null
}

export const requestFullscreen = async (element?: Element): Promise<void> => {
  const currentDocument = getDocument()
  if (currentDocument === undefined) {
    throw new Error(FULLSCREEN_UNAVAILABLE_ERROR)
  }
  const target = element ?? currentDocument?.documentElement
  if (!isFullscreenSupported() || target === undefined || typeof target.requestFullscreen !== 'function') {
    throw new Error(FULLSCREEN_UNSUPPORTED_ERROR)
  }
  try {
    await target.requestFullscreen()
  } catch (error) {
    throw new Error(FULLSCREEN_REQUEST_ERROR, { cause: error })
  }
}

export const exitFullscreen = async (): Promise<void> => {
  const currentDocument = getDocument()
  if (currentDocument === undefined) {
    throw new Error(FULLSCREEN_UNAVAILABLE_ERROR)
  }
  if (currentDocument.fullscreenElement === null) {
    throw new Error(FULLSCREEN_NOT_ACTIVE_ERROR)
  }
  if (!isFullscreenSupported()) {
    throw new Error(FULLSCREEN_UNSUPPORTED_ERROR)
  }
  try {
    await currentDocument.exitFullscreen()
  } catch (error) {
    throw new Error(FULLSCREEN_EXIT_ERROR, { cause: error })
  }
}
