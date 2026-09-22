import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '../services/storage'
import {
  DEFAULT_CERTIFICATE_NICKNAME,
  assertCertificateNickname,
  validateCertificateNickname,
} from '../services/certificate'

interface PersistedCertificateSettings {
  nickname: string
}

const isPersistedCertificateSettings = (value: unknown): value is PersistedCertificateSettings => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return Object.keys(candidate).length === 1
    && typeof candidate.nickname === 'string'
    && validateCertificateNickname(candidate.nickname)
}

export const useCertificateStore = defineStore('certificate', () => {
  const saved = storage.get<PersistedCertificateSettings>(
    'mathefox-certificate-settings',
    { nickname: DEFAULT_CERTIFICATE_NICKNAME },
    isPersistedCertificateSettings,
  )
  const nickname = ref(saved.nickname)
  const nicknameError = ref('')

  const hasCustomNickname = computed(() => nickname.value !== DEFAULT_CERTIFICATE_NICKNAME)

  const persist = (): void => {
    storage.set<PersistedCertificateSettings>('mathefox-certificate-settings', { nickname: nickname.value })
  }

  const setNickname = (value: string): void => {
    try {
      nickname.value = assertCertificateNickname(value)
      nicknameError.value = ''
      persist()
    } catch (error) {
      nicknameError.value = error instanceof Error ? error.message : 'Der Spitzname ist ungültig.'
      throw error
    }
  }

  const resetNickname = (): void => {
    nickname.value = DEFAULT_CERTIFICATE_NICKNAME
    nicknameError.value = ''
    persist()
  }

  return { nickname, nicknameError, hasCustomNickname, setNickname, resetNickname }
})
