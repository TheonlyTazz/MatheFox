import type { Exercise, ExerciseAnswer, ExerciseFactory, ExerciseType, GradeLevel, TopicCatalog } from '../../types/curriculum'

export const randomInt = (seed: number | undefined, min: number, max: number): number => {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) throw new Error(`Ungültiger Zufallsbereich: ${min} bis ${max}.`)
  const source = seed === undefined ? Date.now() : seed
  const value = Math.abs(Math.sin(source * 12.9898) * 43758.5453) % 1
  return min + Math.floor(value * (max - min + 1))
}

export const factory = (create: (seed: number) => Exercise): ExerciseFactory => (seed = Date.now()) => create(seed)

export const numberExercise = (grade: GradeLevel, topicId: string, title: string, instruction: string, answer: number, seed = 0, hint?: string): Exercise => ({
  id: `${topicId}-${seed}`, topicId, grade, title, instruction, type: 'number-input', data: { answer }, hint,
  explanation: `Die richtige Antwort ist ${answer}.`, xpReward: 10, validate: (value: ExerciseAnswer) => value === answer || (typeof value === 'string' && Number(value.replace(',', '.')) === answer),
})

export const choiceExercise = (grade: GradeLevel, topicId: string, title: string, instruction: string, options: readonly string[], answer: string, seed = 0): Exercise => ({
  id: `${topicId}-${seed}`, topicId, grade, title, instruction, type: 'multiple-choice', data: { options, answer }, xpReward: 10,
  validate: (value: ExerciseAnswer) => value === answer,
})

export const topic = (grade: GradeLevel, id: string, title: string, description: string, icon: string, factories: readonly ExerciseFactory[], staticExercises?: readonly Exercise[]): TopicCatalog => ({ grade, id, title, description, icon, factories, staticExercises })

export const isAnswer = (value: ExerciseAnswer, expected: ExerciseAnswer): boolean => value === expected
export const typeOf = <T extends ExerciseType>(type: T): T => type
