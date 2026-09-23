import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getGradeCatalog } from '../data/grades'
import type { GradeLevel } from '../types/curriculum'

export interface UserProfile {
  nickname: string
  avatar: string
  currentGrade: GradeLevel
  activeTopicIds: string[]
  hasCompletedWizard: boolean
  dailyStreak: number
  xp: number
  unlockedBadgeIds: string[]
  completedTopicIds: string[]
  lastPlayed: string
}

const STORAGE_KEY = 'mathefox-profile'
const avatars = ['owl', 'fox', 'cat', 'robot', 'bear', 'dragon'] as const
const grades: readonly GradeLevel[] = [1, 2, 3, 4]

const topicsFor = (grade: GradeLevel): string[] => getGradeCatalog(grade).topics.map((topic) => topic.id)
const allTopicIds = (): string[] => grades.flatMap((grade) => topicsFor(grade))

const defaultProfile = (): UserProfile => ({
  nickname: 'Mathe-Held', avatar: 'fox', currentGrade: 1,
  activeTopicIds: topicsFor(1), hasCompletedWizard: false,
  dailyStreak: 0, xp: 0, unlockedBadgeIds: [], completedTopicIds: [], lastPlayed: '',
})

const isGrade = (value: unknown): value is GradeLevel => grades.includes(value as GradeLevel)
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string')
const hasUniqueItems = (items: readonly string[]): boolean => new Set(items).size === items.length
const isProfile = (value: unknown): value is UserProfile => {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.nickname === 'string' && candidate.nickname.trim().length > 0
    && typeof candidate.avatar === 'string' && avatars.includes(candidate.avatar as typeof avatars[number])
    && isGrade(candidate.currentGrade) && isStringArray(candidate.activeTopicIds) && hasUniqueItems(candidate.activeTopicIds)
    && typeof candidate.hasCompletedWizard === 'boolean'
    && typeof candidate.dailyStreak === 'number' && Number.isInteger(candidate.dailyStreak) && candidate.dailyStreak >= 0
    && typeof candidate.xp === 'number' && Number.isInteger(candidate.xp) && candidate.xp >= 0
    && isStringArray(candidate.unlockedBadgeIds) && hasUniqueItems(candidate.unlockedBadgeIds)
    && candidate.unlockedBadgeIds.every((badgeId) => badgeId.startsWith('topic:') && allTopicIds().includes(badgeId.slice(6)))
    && isStringArray(candidate.completedTopicIds) && hasUniqueItems(candidate.completedTopicIds)
    && typeof candidate.lastPlayed === 'string'
}

const loadProfile = (): UserProfile => {
  const initial = defaultProfile()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return initial
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isProfile(parsed)) throw new Error('Invalid profile shape')
    const validTopics = topicsFor(parsed.currentGrade)
    if (parsed.activeTopicIds.some((topicId) => !validTopics.includes(topicId))) throw new Error('Invalid topic selection')
    if (parsed.completedTopicIds.some((topicId) => !allTopicIds().includes(topicId))) throw new Error('Invalid completed topic')
    return parsed
  } catch (error) {
    throw new Error(`Stored profile is invalid: ${error instanceof Error ? error.message : 'invalid JSON'}`)
  }
}

export const useProfileStore = defineStore('profile', () => {
  const saved = loadProfile()
  const nickname = ref(saved.nickname)
  const avatar = ref(saved.avatar)
  const currentGrade = ref<GradeLevel>(saved.currentGrade)
  const activeTopicIds = ref<string[]>([...saved.activeTopicIds])
  const hasCompletedWizard = ref(saved.hasCompletedWizard)
  const dailyStreak = ref(saved.dailyStreak)
  const xp = ref(saved.xp)
  const unlockedBadgeIds = ref<string[]>([...saved.unlockedBadgeIds])
  const completedTopicIds = ref<string[]>([...saved.completedTopicIds])
  const lastPlayed = ref(saved.lastPlayed)
  const availableTopics = computed(() => getGradeCatalog(currentGrade.value).topics)

  const persist = (): void => {
    const snapshot = {
    nickname: nickname.value, avatar: avatar.value, currentGrade: currentGrade.value,
    activeTopicIds: activeTopicIds.value, hasCompletedWizard: hasCompletedWizard.value,
    dailyStreak: dailyStreak.value, xp: xp.value, unlockedBadgeIds: unlockedBadgeIds.value,
    completedTopicIds: completedTopicIds.value,
    lastPlayed: lastPlayed.value,
    } satisfies UserProfile
    if (!isProfile(snapshot)) throw new Error('Profile mutation produced an invalid state')
    const validActiveTopics = topicsFor(snapshot.currentGrade)
    if (snapshot.activeTopicIds.some((topicId) => !validActiveTopics.includes(topicId)) || snapshot.completedTopicIds.some((topicId) => !allTopicIds().includes(topicId))) throw new Error('Profile mutation produced an unknown topic')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }
  watch(
    [nickname, avatar, currentGrade, activeTopicIds, hasCompletedWizard, dailyStreak, xp, unlockedBadgeIds, completedTopicIds, lastPlayed],
    persist,
    { deep: true },
  )

  const completeWizard = (data: Partial<UserProfile>): void => {
    if (data.nickname !== undefined) nickname.value = data.nickname.trim() || 'Mathe-Held'
    if (data.avatar !== undefined) {
      if (!avatars.includes(data.avatar as typeof avatars[number])) throw new Error(`Unknown avatar: ${data.avatar}`)
      avatar.value = data.avatar
    }
    if (data.currentGrade !== undefined) switchGrade(data.currentGrade)
    if (data.activeTopicIds !== undefined) {
      const valid = topicsFor(currentGrade.value)
      if (data.activeTopicIds.some((topicId) => !valid.includes(topicId)) || !hasUniqueItems(data.activeTopicIds)) throw new Error('Unknown or duplicate topic selected')
      activeTopicIds.value = [...data.activeTopicIds]
    }
    hasCompletedWizard.value = true
    persist()
  }

  const switchGrade = (grade: GradeLevel): void => {
    if (!isGrade(grade)) throw new Error(`Unknown grade: ${grade}`)
    currentGrade.value = grade
    activeTopicIds.value = topicsFor(grade)
    persist()
  }

  const toggleTopic = (topicId: string): void => {
    if (!topicsFor(currentGrade.value).includes(topicId)) throw new Error(`Unknown topic: ${topicId}`)
    activeTopicIds.value = activeTopicIds.value.includes(topicId)
      ? activeTopicIds.value.filter((id) => id !== topicId)
      : [...activeTopicIds.value, topicId]
    persist()
  }

  const selectAllTopics = (): void => { activeTopicIds.value = topicsFor(currentGrade.value); persist() }
  const deselectAllTopics = (): void => { activeTopicIds.value = []; persist() }

  const award = (topicId: string, points: number): void => {
    if (!Number.isInteger(points) || points < 0) throw new Error('Award points must be a non-negative integer')
    if (!topicsFor(currentGrade.value).includes(topicId)) throw new Error(`Unknown topic: ${topicId}`)
    xp.value += points
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (lastPlayed.value !== today) {
      const previous = lastPlayed.value ? new Date(`${lastPlayed.value}T00:00:00Z`) : undefined
      const current = new Date(`${today}T00:00:00Z`)
      const elapsedDays = previous === undefined ? undefined : Math.round((current.getTime() - previous.getTime()) / 86_400_000)
      dailyStreak.value = elapsedDays === 1 ? dailyStreak.value + 1 : 1
      lastPlayed.value = today
    }
    persist()
  }

  const completeTopic = (topicId: string): void => {
    if (!topicsFor(currentGrade.value).includes(topicId)) throw new Error(`Unknown topic: ${topicId}`)
    if (!completedTopicIds.value.includes(topicId)) completedTopicIds.value.push(topicId)
    const badgeId = `topic:${topicId}`
    if (!unlockedBadgeIds.value.includes(badgeId)) unlockedBadgeIds.value.push(badgeId)
    persist()
  }

  return { nickname, avatar, currentGrade, activeTopicIds, hasCompletedWizard, dailyStreak, xp, unlockedBadgeIds, completedTopicIds, lastPlayed, availableTopics, completeWizard, switchGrade, toggleTopic, selectAllTopics, deselectAllTopics, award, completeTopic }
})

export type { GradeLevel }
