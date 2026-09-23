import { grade1 } from './grade1'
import { grade2 } from './grade2'
import { grade3 } from './grade3'
import { grade4 } from './grade4'
import type { Exercise, ExerciseFactory, GradeCatalog, GradeLevel } from '../../types/curriculum'

const catalogs: Readonly<Record<GradeLevel, GradeCatalog>> = { 1: grade1, 2: grade2, 3: grade3, 4: grade4 }
export const getGradeCatalog = (grade: GradeLevel): GradeCatalog => {
  if (!Number.isInteger(grade) || !(grade in catalogs)) throw new Error(`Ungültige Klassenstufe: ${grade}`)
  return catalogs[grade]
}

const topicFor = (grade: GradeLevel, topicId: string) => {
  const topic = getGradeCatalog(grade).topics.find((candidate) => candidate.id === topicId)
  if (!topic) throw new Error(`Thema ${topicId} gehört nicht zu Klasse ${grade}.`)
  return topic
}

export const generateExercise = (grade: GradeLevel, topicId: string, seed = Date.now()): Exercise => {
  const catalog = topicFor(grade, topicId)
  const factories = catalog.factories
  const staticExercises = catalog.staticExercises === undefined ? [] : catalog.staticExercises
  if (factories.length === 0 && staticExercises.length === 0) throw new Error(`Thema ${topicId} hat keine Aufgaben.`)
  const poolSize = factories.length + staticExercises.length
  const selected = Math.abs(seed) % poolSize
  const exercise = selected < factories.length
    ? factories[selected](seed)
    : (() => {
      const staticExercise = staticExercises[selected - factories.length]
      if (staticExercise === undefined) throw new Error('Statische Aufgabe konnte nicht gewählt werden.')
      return { ...staticExercise, id: `${staticExercise.id}-${seed}` }
    })()
  if (exercise.grade !== grade || exercise.topicId !== topicId) throw new Error('Generator erzeugte eine unpassende Aufgabe.')
  return exercise
}

export const generateSession = (grade: GradeLevel, topicIds?: readonly string[], count = 10, seed = Date.now()): Exercise[] => {
  if (!Number.isInteger(count) || count < 1) throw new Error('Eine Sitzung braucht mindestens eine Aufgabe.')
  const ids = topicIds === undefined ? getGradeCatalog(grade).topics.map((topic) => topic.id) : topicIds
  if (ids.length === 0) throw new Error('Mindestens ein Thema muss ausgewählt sein.')
  const offset = Math.abs(seed) % ids.length
  return Array.from({ length: count }, (_, index) => {
    const topicId = ids[(offset + index) % ids.length]
    if (!topicId) throw new Error('Themenliste enthält eine ungültige Themen-ID.')
    return generateExercise(grade, topicId, seed + index)
  })
}

export type { Exercise, ExerciseFactory, GradeCatalog, GradeLevel } from '../../types/curriculum'
export { grade1, grade2, grade3, grade4 }
