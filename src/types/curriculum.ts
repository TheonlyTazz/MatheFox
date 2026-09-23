export type GradeLevel = 1 | 2 | 3 | 4

export type ExerciseType =
  | 'number-input'
  | 'multiple-choice'
  | 'table-fill'
  | 'matching'
  | 'clock-interactive'
  | 'grid-alignment'
  | 'shape-detective'
  | 'spatial-grid'
  | 'number-wall'
  | 'symmetry-grid'
  | 'comparison'
  | 'mirror-grid'

export type ExerciseVisual =
  | { kind: 'tokens'; tokens: readonly string[] }
  | { kind: 'pairs'; icon: string; groups: number; mirrored: boolean }
  | { kind: 'wheel'; sectors: readonly { label: string; color: string }[] }
  | { kind: 'bars'; orientation?: 'horizontal' | 'vertical'; bars: readonly { label: string; value: number; color: string }[] }
  | { kind: 'grid-shape'; columns: number; cells: readonly boolean[] }
  | { kind: 'combinations'; layout?: 'tree'; groups: readonly { label: string; options: readonly string[] }[] }
  | { kind: 'ten-frame'; capacity: 10 | 20; redCount: number }
  | { kind: 'coin-wallet' }
  | { kind: 'multiplication-array'; rows: number; columns: number }
  | { kind: 'frog-number-line'; start: number; target: number }

export interface NumberInputData { answer: number; unit?: string }
export interface MultipleChoiceData { options: readonly string[]; answer: string }
export interface TableFillData { headers: readonly string[]; rows: readonly (readonly (string | number | null)[])[]; answers: readonly (string | number)[] }
export interface MatchingData { left: readonly string[]; right: readonly string[]; pairs: readonly (readonly [number, number])[] }
export interface ClockInteractiveData { hour: number; minute: number; format: 'analog' | 'digital' }
export interface GridAlignmentData { size: number; values: readonly (number | null)[]; answers: readonly number[] }
export interface ShapeDetectiveData { shape: 'circle' | 'triangle' | 'square' | 'rectangle' | 'cube' | 'sphere' | 'cuboid'; properties: readonly string[]; answer: string }
export interface SpatialGridData { reference: string; referenceIndex: number; secondaryReferenceIndex?: number; answerIndex: number; columns: number; rows: number }
export interface NumberWallData { rows: readonly (readonly (number | null)[])[]; answers: readonly number[] }
export interface SymmetryGridData { columns: number; rows: number; axisAfterColumn: number; filledIndices: readonly number[]; answerIndices: readonly number[] }
export interface ComparisonData { left: number; right: number; answer: '<' | '>' | '=' }
export interface MirrorGridData { filledIndices: readonly number[]; answerIndices: readonly number[] }

export interface ExerciseBase<T extends ExerciseType, D> {
  id: string
  topicId: string
  grade: GradeLevel
  title: string
  instruction: string
  type: T
  data: D
  hint?: string
  explanation?: string
  visual?: ExerciseVisual
  validate: (answer: ExerciseAnswer) => boolean | { correct: boolean; message?: string }
  xpReward: number
}

export type Exercise =
  | ExerciseBase<'number-input', NumberInputData>
  | ExerciseBase<'multiple-choice', MultipleChoiceData>
  | ExerciseBase<'table-fill', TableFillData>
  | ExerciseBase<'matching', MatchingData>
  | ExerciseBase<'clock-interactive', ClockInteractiveData>
  | ExerciseBase<'grid-alignment', GridAlignmentData>
  | ExerciseBase<'shape-detective', ShapeDetectiveData>
  | ExerciseBase<'spatial-grid', SpatialGridData>
  | ExerciseBase<'number-wall', NumberWallData>
  | ExerciseBase<'symmetry-grid', SymmetryGridData>
  | ExerciseBase<'comparison', ComparisonData>
  | ExerciseBase<'mirror-grid', MirrorGridData>

export type ExerciseAnswer = number | string | readonly number[] | readonly string[] | Readonly<Record<string, string | number>>
export type ExerciseFactory = (seed?: number) => Exercise

export interface TopicCatalog {
  id: string
  grade: GradeLevel
  title: string
  description: string
  icon: string
  factories: readonly ExerciseFactory[]
  staticExercises?: readonly Exercise[]
}

export interface GradeCatalog {
  grade: GradeLevel
  title: string
  topics: readonly TopicCatalog[]
}
