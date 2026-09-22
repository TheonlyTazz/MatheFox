import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import confetti from 'canvas-confetti'
import { storage } from '../services/storage'
import { playBeep } from '../services/audio'
import { getLocalDateKey } from '../data/dailyChallenge'
import type { TopicKey } from '../types/math'

interface SavedProgress {
  xp: number
  streak: number
  completed: Record<TopicKey, number>
  badges: string[]
  lastPlayed: string
}

const blank: SavedProgress = {
  xp: 0, streak: 0, completed: {
    klammern: 0,
    schriftlich_komma: 0,
    zeit: 0,
    preise: 0,
    fachbegriffe: 0,
    grundrechenarten: 0,
    geometrie: 0,
    sachaufgaben: 0,
  }, badges: [], lastPlayed: '',
}

const isSavedProgress = (value: unknown): value is SavedProgress => {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const completed = candidate.completed
  if (completed === null || typeof completed !== 'object') return false
  const completedRecord = completed as Record<string, unknown>
  const topicKeys: TopicKey[] = ['klammern', 'schriftlich_komma', 'zeit', 'preise', 'fachbegriffe', 'grundrechenarten', 'geometrie', 'sachaufgaben']
  return typeof candidate.xp === 'number'
    && typeof candidate.streak === 'number'
    && topicKeys.every((topic) => typeof completedRecord[topic] === 'number')
    && Array.isArray(candidate.badges)
    && candidate.badges.every((badge) => typeof badge === 'string')
    && typeof candidate.lastPlayed === 'string'
}

export const useProgressStore = defineStore('progress', () => {
  const saved = storage.get('mathefox-progress', blank, isSavedProgress)
  const xp = ref(saved.xp)
  const streak = ref(saved.streak)
  const completed = ref<Record<TopicKey, number>>(saved.completed)
  const badges = ref<string[]>(saved.badges)
  const lastPlayed = ref(saved.lastPlayed)
  const level = computed(() => Math.floor(xp.value / 100) + 1)
  const levelProgress = computed(() => xp.value % 100)

  const persist = (): void => storage.set('mathefox-progress', { xp: xp.value, streak: streak.value, completed: completed.value, badges: badges.value, lastPlayed: lastPlayed.value })
  const award = (topic: TopicKey, points: number): void => {
    const today = getLocalDateKey(new Date())
    if (lastPlayed.value !== today) {
      const previousDay = lastPlayed.value ? new Date(`${lastPlayed.value}T00:00:00`) : undefined
      const currentDay = new Date(`${today}T00:00:00`)
      const daysSinceLastPlay = previousDay ? Math.round((currentDay.getTime() - previousDay.getTime()) / 86400000) : undefined
      streak.value = daysSinceLastPlay === 1 ? Math.min(streak.value + 1, 7) : 1
    }
    lastPlayed.value = today
    xp.value += points
    completed.value[topic] = (completed.value[topic] ?? 0) + 1
    if (streak.value >= 3 && !badges.value.includes('3-Tage-Streak')) badges.value.push('3-Tage-Streak')
    const badgeMap: Partial<Record<TopicKey, string>> = { zeit: 'Zeit-Meisterin', klammern: 'Klammer-Profi', geometrie: 'Formen-Detektiv', grundrechenarten: 'Rechenkönigin' }
    const badge = badgeMap[topic]
    if (badge && !badges.value.includes(badge)) badges.value.push(badge)
    persist()
    playBeep(880, 0.12)
    if ((completed.value[topic] ?? 0) % 3 === 0 || streak.value >= 3) void confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } })
  }

  return { xp, streak, completed, badges, level, levelProgress, award }
})
