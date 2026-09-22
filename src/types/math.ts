export type TopicKey = 'klammern' | 'schriftlich_komma' | 'zeit' | 'preise' | 'fachbegriffe' | 'grundrechenarten' | 'geometrie' | 'sachaufgaben'
export type Grade = 4 | 5
export type ExerciseKind = 'choice' | 'number' | 'text'
export type ExerciseValidator = (input: string) => boolean

export interface Exercise {
  id: string
  topic: TopicKey
  kind: ExerciseKind
  prompt: string
  options?: string[]
  answer: string
  validate: ExerciseValidator
  hint: string
  explanation: string
  xp: number
}

export interface MathTestModule {
  id: string
  title: string
  date: string
  grade: Grade
  durationMinutes: number
  exerciseIds: string[]
  description: string
}

export interface Topic {
  key: TopicKey
  title: string
  emoji: string
  color: string
  description: string
}
