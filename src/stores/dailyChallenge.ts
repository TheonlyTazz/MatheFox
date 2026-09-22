import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { generateDailyChallenge, getLocalDateKey, type DailyChallenge } from '../data/dailyChallenge'
import { storage } from '../services/storage'
import { useProgressStore } from './progress'
import type { Exercise } from '../types/math'

export interface DailyChallengeResult {
  input: string
  correct: boolean
  awarded: boolean
}

interface PersistedDailyChallenge {
  version: 1
  dateKey: string
  results: Record<string, DailyChallengeResult>
}

const storageKey = (dateKey: string): string => `mathefox-daily-challenge-${dateKey}`

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
)

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const actual = Object.keys(value).sort()
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index])
}

const isDateKey = (value: unknown): value is string => (
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
)

const isDailyChallengeResult = (value: unknown): value is DailyChallengeResult => {
  if (!isPlainObject(value) || !hasExactKeys(value, ['input', 'correct', 'awarded'])) return false
  return typeof value.input === 'string'
    && typeof value.correct === 'boolean'
    && typeof value.awarded === 'boolean'
    && value.awarded === value.correct
}

const isPersistedDailyChallenge = (value: unknown): value is PersistedDailyChallenge => {
  if (!isPlainObject(value) || !hasExactKeys(value, ['version', 'dateKey', 'results'])) return false
  if (value.version !== 1 || !isDateKey(value.dateKey) || !isPlainObject(value.results)) return false
  return Object.values(value.results).every(isDailyChallengeResult)
}

const loadResults = (dateKey: string, dailyChallenge: DailyChallenge): Record<string, DailyChallengeResult> => {
  const fallback: PersistedDailyChallenge = { version: 1, dateKey, results: {} }
  const saved = storage.get(storageKey(dateKey), fallback, isPersistedDailyChallenge)
  if (saved.dateKey !== dateKey) throw new Error('Gespeicherte Tages-Challenge gehört zum falschen Datum.')
  for (const questionId of Object.keys(saved.results)) {
    if (!dailyChallenge.questions.some((question) => question.id === questionId)) {
      throw new Error(`Gespeicherte Antwort gehört nicht zur Tages-Challenge: ${questionId}`)
    }
  }
  return { ...saved.results }
}

export const useDailyChallengeStore = defineStore('dailyChallenge', () => {
  const currentDateKey = ref(getLocalDateKey(new Date()))
  const challenge = ref<DailyChallenge>(generateDailyChallenge(currentDateKey.value))
  const attempts = ref<Record<string, DailyChallengeResult>>(loadResults(currentDateKey.value, challenge.value))
  const progress = useProgressStore()

  const syncToToday = (): void => {
    const today = getLocalDateKey(new Date())
    if (today !== currentDateKey.value) loadDate(today)
  }

  const persist = (): void => {
    storage.set<PersistedDailyChallenge>(storageKey(currentDateKey.value), {
      version: 1,
      dateKey: currentDateKey.value,
      results: { ...attempts.value },
    })
  }

  const completion = computed(() => (
    challenge.value.questions.length > 0
    && challenge.value.questions.every((question) => attempts.value[question.id] !== undefined)
  ))

  const questionById = (questionId: string): Exercise => {
    const question = challenge.value.questions.find((candidate) => candidate.id === questionId)
    if (!question) throw new Error(`Unbekannte Tagesaufgabe: ${questionId}`)
    return question
  }

  const submit = (questionId: string, input: string): DailyChallengeResult => {
    if (typeof questionId !== 'string' || questionId.length === 0) throw new Error('Eine Aufgaben-ID ist erforderlich.')
    if (typeof input !== 'string') throw new Error('Die Antwort muss eine Zeichenkette sein.')
    if (attempts.value[questionId]) throw new Error(`Die Tagesaufgabe ${questionId} wurde bereits beantwortet.`)

    const question = questionById(questionId)
    const correct = question.validate(input)
    const result: DailyChallengeResult = { input, correct, awarded: correct }
    attempts.value[questionId] = result
    persist()
    if (result.correct && result.awarded) progress.award(question.topic, question.xp)
    return result
  }

  const loadDate = (dateKey: string): void => {
    if (!isDateKey(dateKey)) throw new Error(`Ungültiger Tages-Schlüssel: ${dateKey}`)
    const nextChallenge = generateDailyChallenge(dateKey)
    const nextResults = loadResults(dateKey, nextChallenge)
    currentDateKey.value = dateKey
    challenge.value = nextChallenge
    attempts.value = nextResults
  }

  const results = computed<Record<string, DailyChallengeResult>>(() => Object.fromEntries(
    Object.entries(attempts.value).map(([questionId, result]) => [questionId, { ...result }]),
  ))

  return {
    currentDateKey,
    challenge,
    results,
    completion,
    questionById,
    submit,
    syncToToday,
    loadDate,
  }
})
