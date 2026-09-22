import type { Exercise, TopicKey } from '../types/math'
import { TOPIC_KEYS, generateSeededExercise, generateSeededSession } from './generator'

export const DAILY_CHALLENGE_TITLE = 'Tägliche Mathe-Challenge'
export const DAILY_CHALLENGE_DESCRIPTION = 'Eine Aufgabe aus jedem Mathe-Thema und zwei Extra-Fragen.'

export interface DailyChallenge {
  dateKey: string
  title: string
  description: string
  questions: Exercise[]
}

const isValidDateKey = (dateKey: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false
  const [yearText, monthText, dayText] = dateKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export const getLocalDateKey = (date: Date): string => {
  if (Number.isNaN(date.getTime())) throw new Error('Ein ungültiges Datum kann keinen Tages-Schlüssel erzeugen.')
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const generateDailyChallenge = (dateKey: string): DailyChallenge => {
  if (!isValidDateKey(dateKey)) throw new Error(`Ungültiger Tages-Schlüssel: ${dateKey}`)
  const generated = TOPIC_KEYS.map((topic, index) => (
    generateSeededExercise(`${dateKey}-topic-${index}`, topic, 4)
  ))
  generated.push(...generateSeededSession(`${dateKey}-extras`, { count: 2, grade: 4 }))
  const questions = generated.map((question, index) => ({
    ...question,
    id: `${dateKey}-${index + 1}`,
  }))

  if (questions.length !== 10 || new Set(questions.map((question) => question.id)).size !== 10) {
    throw new Error('Tages-Challenge muss genau zehn eindeutige Aufgaben enthalten.')
  }
  if (!TOPIC_KEYS.every((topic: TopicKey) => questions.some((question) => question.topic === topic))) {
    throw new Error('Tages-Challenge enthält nicht alle Themen.')
  }

  return {
    dateKey,
    title: DAILY_CHALLENGE_TITLE,
    description: DAILY_CHALLENGE_DESCRIPTION,
    questions,
  }
}
