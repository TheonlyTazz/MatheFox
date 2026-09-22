import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  exitFullscreen,
  isFullscreen,
  isFullscreenSupported,
  requestFullscreen,
} from '../services/fullscreen'

export const useFullscreen = () => {
  const isSupported = ref(isFullscreenSupported())
  const isActive = ref(isFullscreen())
  const errorMessage = ref<string | undefined>()

  const syncFullscreenState = (): void => {
    isSupported.value = isFullscreenSupported()
    isActive.value = isFullscreen()
  }

  const toggleFullscreen = async (): Promise<void> => {
    errorMessage.value = undefined
    try {
      if (isActive.value) await exitFullscreen()
      else await requestFullscreen()
      syncFullscreenState()
    } catch (error) {
      errorMessage.value = error instanceof Error
        ? error.message
        : 'Der Vollbildmodus konnte nicht geändert werden.'
      syncFullscreenState()
    }
  }

  onMounted(() => {
    syncFullscreenState()
    document.addEventListener('fullscreenchange', syncFullscreenState)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', syncFullscreenState)
  })

  return {
    errorMessage,
    isActive,
    isSupported,
    toggleFullscreen,
  }
}
