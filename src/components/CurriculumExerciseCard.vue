<script setup lang="ts">
import { Check, HelpCircle, RotateCcw, Sparkles } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import confetti from 'canvas-confetti'
import ExerciseVisual from './ExerciseVisual.vue'
import DraggableClockWidget from './widgets/DraggableClockWidget.vue'
import ShapeSelectWidget from './widgets/ShapeSelectWidget.vue'
import ComparisonWidget from './widgets/ComparisonWidget.vue'
import MirrorGridWidget from './widgets/MirrorGridWidget.vue'
import { useSpeech } from '../composables/useSpeech'
import { playBeep } from '../services/audio'
import { useProfileStore } from '../stores/profile'
import type {
  ClockInteractiveData,
  Exercise,
  ExerciseAnswer,
  GridAlignmentData,
  MatchingData,
  NumberInputData,
  NumberWallData,
  ShapeDetectiveData,
  SpatialGridData,
  SymmetryGridData,
  TableFillData,
} from '../types/curriculum'

const props = withDefaults(defineProps<{
  exercise: Exercise
  singleAttempt?: boolean
  showNext?: boolean
}>(), { singleAttempt: false, showNext: true })

const emit = defineEmits<{ solved: [correct: boolean, credit: boolean]; next: [] }>()
const profile = useProfileStore()
const { speak, stop, isSpeaking, isLoading: speechLoading, error: speechError } = useSpeech()
const readAloud = (text: string): void => {
  try { speak(text) }
  catch (error) { speechError.value = error instanceof Error ? error.message : 'Vorlesen fehlgeschlagen.' }
}

const submitted = ref(false)
const credited = ref(false)
const showHint = ref(false)
const selected = ref<string | number | null>(null)
const numberAnswer = ref('')
const tableAnswer = ref<Array<string | number>>([])
const matchingAnswer = ref<number[]>([])
const gridAnswer = ref<string[]>([])
const spatialAnswer = ref<number | null>(null)
const wallAnswer = ref<string[]>([])
const symmetryAnswer = ref<number[]>([])
const mirrorAnswer = ref<number[]>([])
const selectedHour = ref(1)
const selectedMinute = ref(0)
const resultMessage = ref('')
const submittedCorrect = ref(false)
const mistakeCount = ref(0)

const numberData = computed<NumberInputData | null>(() => props.exercise.type === 'number-input' ? props.exercise.data : null)
const tableData = computed<TableFillData | null>(() => props.exercise.type === 'table-fill' ? props.exercise.data : null)
const matchingData = computed<MatchingData | null>(() => props.exercise.type === 'matching' ? props.exercise.data : null)
const clockData = computed<ClockInteractiveData | null>(() => props.exercise.type === 'clock-interactive' ? props.exercise.data : null)
const gridData = computed<GridAlignmentData | null>(() => props.exercise.type === 'grid-alignment' ? props.exercise.data : null)
const spatialData = computed<SpatialGridData | null>(() => props.exercise.type === 'spatial-grid' ? props.exercise.data : null)
const wallData = computed<NumberWallData | null>(() => props.exercise.type === 'number-wall' ? props.exercise.data : null)
const symmetryData = computed<SymmetryGridData | null>(() => props.exercise.type === 'symmetry-grid' ? props.exercise.data : null)

const shapeLabels: Record<ShapeDetectiveData['shape'], string> = {
  circle: 'Kreis', triangle: 'Dreieck', square: 'Quadrat', rectangle: 'Rechteck',
  cube: 'Würfel', sphere: 'Kugel', cuboid: 'Quader',
}
const shapeChoices: readonly ShapeDetectiveData['shape'][] = ['circle', 'triangle', 'square', 'rectangle', 'cube', 'sphere', 'cuboid']
const shapeOptions = computed(() => shapeChoices.slice(0, props.exercise.grade <= 2 ? 4 : 7).map((shape) => shapeLabels[shape]))
const shapeSelection = computed<string | null>({
  get: () => typeof selected.value === 'string' ? selected.value : null,
  set: (value) => { selected.value = value },
})
const comparisonSelection = computed<'<' | '>' | '=' | null>({
  get: () => selected.value === '<' || selected.value === '>' || selected.value === '=' ? selected.value : null,
  set: (value) => { selected.value = value },
})
const clockValue = computed({
  get: () => ({ hour: selectedHour.value, minute: selectedMinute.value }),
  set: (value: { hour: number; minute: number }) => { selectedHour.value = value.hour; selectedMinute.value = value.minute },
})

const tableCells = computed(() => {
  const data = tableData.value
  if (!data) return []
  return data.rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => ({ value, rowIndex, columnIndex })))
})
const blankTableCells = computed(() => tableCells.value.filter((cell) => cell.value === null))
const tableValues = computed(() => tableAnswer.value)
const tableBlankIndex = (rowIndex: number, columnIndex: number): number => blankTableCells.value.findIndex((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex)
const wallBlankIndex = (rowIndex: number, columnIndex: number): number => {
  const rows = wallData.value?.rows
  if (!rows) throw new Error(`Number wall exercise ${props.exercise.id} has no row data`)
  let index = 0
  for (let row = 0; row < rowIndex; row += 1) index += rows[row].filter((value) => value === null).length
  return index + rows[rowIndex].slice(0, columnIndex).filter((value) => value === null).length
}
const matchingReady = computed(() => Boolean(matchingData.value) && matchingAnswer.value.length === matchingData.value?.left.length && matchingAnswer.value.every((item) => item >= 0))
const gridReady = computed(() => Boolean(gridData.value) && gridAnswer.value.length === gridData.value?.answers.length && gridAnswer.value.every((item) => item.trim() !== ''))
const wallBlankCount = computed(() => wallData.value?.rows.flat().filter((value) => value === null).length ?? 0)
const wallReady = computed(() => Boolean(wallData.value) && wallAnswer.value.length === wallBlankCount.value && wallAnswer.value.every((item) => item.trim() !== ''))
const symmetryReady = computed(() => Boolean(symmetryData.value) && symmetryAnswer.value.length > 0)
const hasAnswer = computed(() => {
  switch (props.exercise.type) {
    case 'number-input': return numberAnswer.value.trim() !== ''
    case 'multiple-choice': return typeof selected.value === 'string'
    case 'table-fill': return tableValues.value.length > 0 && tableValues.value.every((item) => String(item).trim() !== '')
    case 'matching': return matchingReady.value
    case 'clock-interactive': return true
    case 'grid-alignment': return gridReady.value
    case 'shape-detective': return typeof selected.value === 'string'
    case 'spatial-grid': return spatialAnswer.value !== null
    case 'number-wall': return wallReady.value
    case 'symmetry-grid': return symmetryReady.value
    case 'comparison': return typeof selected.value === 'string'
    case 'mirror-grid': return mirrorAnswer.value.length > 0
  }
})

const validateAnswer = (answer: ExerciseAnswer): boolean => {
  const validation = props.exercise.validate(answer)
  if (typeof validation === 'boolean') return validation
  resultMessage.value = validation.message === undefined ? '' : validation.message
  return validation.correct
}

const answerForExercise = (): ExerciseAnswer => {
  switch (props.exercise.type) {
    case 'number-input': return numberAnswer.value.trim()
    case 'multiple-choice':
    case 'shape-detective':
    case 'comparison':
      if (typeof selected.value !== 'string') throw new Error(`Exercise ${props.exercise.id} has no selected answer`)
      return selected.value
    case 'table-fill': return tableValues.value.map((item) => {
      const numeric = Number(String(item).replace(',', '.'))
      if (!Number.isFinite(numeric)) throw new Error(`Table exercise ${props.exercise.id} contains a non-numeric answer`)
      return numeric
    })
    case 'matching': return matchingAnswer.value
    case 'clock-interactive': return `${selectedHour.value}:${String(selectedMinute.value).padStart(2, '0')}`
    case 'grid-alignment': return gridAnswer.value.map((item) => Number(item.replace(',', '.')))
    case 'spatial-grid':
      if (spatialAnswer.value === null) throw new Error(`Spatial exercise ${props.exercise.id} has no selected cell`)
      return spatialAnswer.value
    case 'number-wall': return wallAnswer.value.map((item) => {
      const numeric = Number(item.replace(',', '.'))
      if (!Number.isFinite(numeric)) throw new Error(`Number wall exercise ${props.exercise.id} contains a non-numeric answer`)
      return numeric
    })
    case 'symmetry-grid': return [...symmetryAnswer.value].sort((a, b) => a - b)
    case 'mirror-grid': return [...mirrorAnswer.value].sort((a, b) => a - b)
  }
}

const submit = (): void => {
  if (submitted.value || !hasAnswer.value) return
  const correct = validateAnswer(answerForExercise())
  submittedCorrect.value = correct
  submitted.value = true
  if (correct) {
    playBeep(880, 0.12)
    window.setTimeout(() => playBeep(1175, 0.15), 110)
    void confetti({ particleCount: 65, spread: 70, origin: { y: 0.65 } })
  } else {
    mistakeCount.value += 1
  }
  if (correct && !credited.value) {
    credited.value = true
    emit('solved', true, true)
  } else {
    emit('solved', correct, false)
  }
}

const retry = (): void => {
  submitted.value = false
  submittedCorrect.value = false
  showHint.value = false
  resultMessage.value = ''
  spatialAnswer.value = null
  symmetryAnswer.value = []
  mirrorAnswer.value = []
  if (wallData.value) wallAnswer.value = wallData.value.rows.flat().filter((value): value is null => value === null).map(() => '')
}

const chooseMatching = (side: 'left' | 'right', index: number): void => {
  if (side === 'left') {
    selected.value = index
    return
  }
  if (typeof selected.value !== 'number') return
  const next = [...matchingAnswer.value]
  next[selected.value] = index
  matchingAnswer.value = next
  selected.value = null
}

const matchingRightFor = (leftIndex: number): number | undefined => matchingAnswer.value[leftIndex]
const matchingRightLabel = (leftIndex: number): string => {
  const rightIndex = matchingRightFor(leftIndex)
  if (rightIndex === undefined) return '?'
  const label = matchingData.value?.right[rightIndex]
  if (label === undefined) throw new Error(`Matching exercise ${props.exercise.id} points outside the right side`)
  return label
}
const gridValue = (index: number): number => {
  const value = gridData.value?.values[index]
  if (value === undefined || value === null) throw new Error(`Grid exercise ${props.exercise.id} is missing value ${index}`)
  return value
}
const centsLabel = (value: number): string => String(value).padStart(2, '0')

const initialise = (): void => {
  const exercise = props.exercise
  if (exercise.type === 'table-fill') {
    if (blankTableCells.value.length !== exercise.data.answers.length) throw new Error(`Table exercise ${exercise.id} has ${blankTableCells.value.length} blanks but ${exercise.data.answers.length} answers`)
    tableAnswer.value = blankTableCells.value.map(() => '')
  }
  if (exercise.type === 'matching') {
    if (exercise.data.pairs.length !== exercise.data.left.length) throw new Error(`Matching exercise ${exercise.id} must define one pair per left item`)
    matchingAnswer.value = Array.from({ length: exercise.data.left.length }, () => -1)
  }
  if (exercise.type === 'grid-alignment') gridAnswer.value = exercise.data.answers.map(() => '')
  if (exercise.type === 'grid-alignment' && (exercise.data.size !== 2 || exercise.data.values.length !== 4 || exercise.data.answers.length !== 2)) throw new Error(`Grid exercise ${exercise.id} must define two euro/cents operands and two answers`)
  if (exercise.type === 'clock-interactive') {
    selectedHour.value = exercise.data.hour === 12 ? 1 : exercise.data.hour + 1
    selectedMinute.value = exercise.grade === 1 ? 0 : (exercise.data.minute + 5) % 60
  }
  if (exercise.type === 'spatial-grid') {
    const cellCount = exercise.data.columns * exercise.data.rows
    if (!Number.isInteger(exercise.data.columns) || exercise.data.columns < 1 || !Number.isInteger(exercise.data.rows) || exercise.data.rows < 1) throw new Error(`Spatial exercise ${exercise.id} must have positive integer dimensions`)
    const referenceIndices = [exercise.data.referenceIndex, exercise.data.secondaryReferenceIndex].filter((index): index is number => index !== undefined)
    if (![...referenceIndices, exercise.data.answerIndex].every((index) => Number.isInteger(index) && index >= 0 && index < cellCount)) throw new Error(`Spatial exercise ${exercise.id} has an out-of-range cell index`)
    if (new Set(referenceIndices).size !== referenceIndices.length || referenceIndices.includes(exercise.data.answerIndex)) throw new Error(`Spatial exercise ${exercise.id} reference and answer cells must differ`)
  }
  if (exercise.type === 'number-wall') {
    if (exercise.data.rows.length < 1 || exercise.data.rows.some((row) => row.length < 1)) throw new Error(`Number wall exercise ${exercise.id} must have non-empty rows`)
    const blanks = exercise.data.rows.flat().filter((value) => value === null).length
    if (blanks !== exercise.data.answers.length) throw new Error(`Number wall exercise ${exercise.id} has ${blanks} blanks but ${exercise.data.answers.length} answers`)
    wallAnswer.value = exercise.data.answers.map(() => '')
  }
  if (exercise.type === 'symmetry-grid') {
    const cellCount = exercise.data.columns * exercise.data.rows
    if (!Number.isInteger(exercise.data.columns) || exercise.data.columns < 3 || !Number.isInteger(exercise.data.rows) || exercise.data.rows < 1 || !Number.isInteger(exercise.data.axisAfterColumn) || exercise.data.axisAfterColumn < 1 || exercise.data.axisAfterColumn >= exercise.data.columns - 1) throw new Error(`Symmetry exercise ${exercise.id} has invalid dimensions or axis`)
    if ([...exercise.data.filledIndices, ...exercise.data.answerIndices].some((index) => !Number.isInteger(index) || index < 0 || index >= cellCount)) throw new Error(`Symmetry exercise ${exercise.id} has an out-of-range cell index`)
    if (new Set(exercise.data.filledIndices).size !== exercise.data.filledIndices.length || new Set(exercise.data.answerIndices).size !== exercise.data.answerIndices.length) throw new Error(`Symmetry exercise ${exercise.id} contains duplicate cell indices`)
    if (exercise.data.filledIndices.some((index) => exercise.data.answerIndices.includes(index))) throw new Error(`Symmetry exercise ${exercise.id} source and answer cells overlap`)
    const sourceSides = new Set(exercise.data.filledIndices.map((index) => (index % exercise.data.columns) < exercise.data.axisAfterColumn))
    if (sourceSides.size !== 1 || exercise.data.filledIndices.some((index) => index % exercise.data.columns === exercise.data.axisAfterColumn) || exercise.data.answerIndices.some((index) => index % exercise.data.columns === exercise.data.axisAfterColumn || sourceSides.has((index % exercise.data.columns) < exercise.data.axisAfterColumn))) throw new Error(`Symmetry exercise ${exercise.id} source and answer cells must be on opposite sides of the axis`)
    const mirroredIndices = exercise.data.filledIndices.map((index) => {
      const row = Math.floor(index / exercise.data.columns)
      const column = index % exercise.data.columns
      return row * exercise.data.columns + (2 * exercise.data.axisAfterColumn - column)
    }).sort((a, b) => a - b)
    const answerIndices = [...exercise.data.answerIndices].sort((a, b) => a - b)
    if (mirroredIndices.length !== answerIndices.length || mirroredIndices.some((index, position) => index !== answerIndices[position])) throw new Error(`Symmetry exercise ${exercise.id} answer cells must mirror the source cells`)
  }
  if (exercise.type === 'mirror-grid') {
    const { filledIndices, answerIndices } = exercise.data
    if (filledIndices.length === 0 || answerIndices.length !== filledIndices.length) throw new Error(`Mirror exercise ${exercise.id} needs one answer per source cell`)
    if (filledIndices.some((index) => !Number.isInteger(index) || index < 0 || index >= 64 || index % 8 >= 4)) throw new Error(`Mirror exercise ${exercise.id} has an invalid source cell`)
    const expected = filledIndices.map((index) => Math.floor(index / 8) * 8 + (7 - index % 8)).sort((a, b) => a - b)
    const actual = [...answerIndices].sort((a, b) => a - b)
    if (expected.some((index, position) => index !== actual[position])) throw new Error(`Mirror exercise ${exercise.id} answers are not reflected cells`)
  }
}
initialise()
onMounted(() => {
  if (props.exercise.grade <= 2 && profile.autoReadQuestions) readAloud(`${props.exercise.title}. ${props.exercise.instruction}`)
})
watch(() => profile.autoReadQuestions, (enabled) => {
  if (!enabled) stop()
})

const spatialCells = computed(() => {
  const data = spatialData.value
  if (!data) return []
  return Array.from({ length: data.columns * data.rows }, (_, index) => index)
})
const symmetryCells = computed(() => {
  const data = symmetryData.value
  if (!data) return []
  return Array.from({ length: data.columns * data.rows }, (_, index) => index)
})
const symmetrySourceSide = computed<boolean | null>(() => {
  const data = symmetryData.value
  if (!data || data.filledIndices.length === 0) return null
  return (data.filledIndices[0] % data.columns) < data.axisAfterColumn
})
const isSymmetrySource = (index: number): boolean => symmetryData.value?.filledIndices.includes(index) ?? false
const isSymmetryTarget = (index: number): boolean => {
  const data = symmetryData.value
  const sourceSide = symmetrySourceSide.value
  return Boolean(data && sourceSide !== null && index % data.columns !== data.axisAfterColumn && ((index % data.columns) < data.axisAfterColumn) !== sourceSide)
}
const toggleSymmetryCell = (index: number): void => {
  if (submitted.value || isSymmetrySource(index) || !isSymmetryTarget(index)) return
  symmetryAnswer.value = symmetryAnswer.value.includes(index) ? symmetryAnswer.value.filter((item) => item !== index) : [...symmetryAnswer.value, index]
}
</script>

<template>
  <article class="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-6" :class="{ 'gentle-wobble': submitted && !submittedCorrect && mistakeCount > 0 }">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div><span class="text-xs font-bold uppercase tracking-wider text-orange-500">Aufgabe</span><div class="flex items-center gap-2"><h2 class="mt-1 text-xl font-extrabold leading-tight text-stone-800 md:text-2xl">{{ exercise.title }}</h2><button v-if="exercise.grade <= 2" type="button" class="min-h-14 min-w-14 rounded-full bg-violet-50 text-xl text-violet-800" :aria-label="isSpeaking ? 'Aufgabe erneut vorlesen' : 'Aufgabe vorlesen'" @click="readAloud(`${exercise.title}. ${exercise.instruction}`)">🔊</button></div><p class="mt-2 text-stone-600">{{ exercise.instruction }}</p></div>
      <span class="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">+{{ exercise.xpReward }} XP</span>
    </div>

    <p v-if="speechLoading" class="mb-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-800" role="status">Deutsche Stimme wird geladen …</p>
    <p v-if="speechError" class="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="alert">{{ speechError }}</p>
    <ExerciseVisual v-if="exercise.visual" :visual="exercise.visual" :disabled="submitted" class="mb-5" @answer="numberAnswer = String($event)" />

    <div v-if="exercise.type === 'number-input'" class="flex items-center gap-3">
      <input v-model="numberAnswer" :disabled="submitted" inputmode="decimal" aria-label="Deine Antwort" class="min-h-14 min-w-0 flex-1 rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 text-xl outline-none focus:border-orange-400" placeholder="Deine Antwort ..." @keyup.enter="submit" />
      <span v-if="numberData?.unit" class="font-bold text-stone-600">{{ numberData.unit }}</span>
    </div>

    <div v-else-if="exercise.type === 'multiple-choice'" class="grid gap-3 sm:grid-cols-2">
      <div v-for="option in exercise.data.options" :key="option" class="flex gap-1"><button :disabled="submitted" class="min-h-14 flex-1 rounded-2xl border-2 p-3 text-left font-bold transition" :class="selected === option ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-stone-50 hover:border-orange-300'" @click="selected = option">{{ option }}</button><button v-if="exercise.grade <= 2" type="button" class="min-h-14 min-w-14 rounded-2xl bg-violet-50 text-xl" :aria-label="`${option} vorlesen`" @click="readAloud(option)">🔊</button></div>
    </div>

    <div v-else-if="exercise.type === 'table-fill'" class="overflow-x-auto"><table class="w-full min-w-[18rem] border-separate border-spacing-2"><thead><tr><th v-for="header in exercise.data.headers" :key="header" class="rounded-xl bg-orange-50 p-3 text-left text-sm text-orange-800">{{ header }}</th></tr></thead><tbody><tr v-for="(row, rowIndex) in exercise.data.rows" :key="rowIndex"><td v-for="(value, columnIndex) in row" :key="columnIndex"><span v-if="value !== null" class="flex min-h-14 items-center justify-center rounded-xl bg-stone-100 px-3 font-bold text-stone-700">{{ value }}</span><input v-else v-model="tableAnswer[tableBlankIndex(rowIndex, columnIndex)]" :disabled="submitted" class="min-h-14 min-w-14 w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-3 text-center font-bold outline-none focus:border-orange-400" inputmode="decimal" :aria-label="`${exercise.data.headers[columnIndex]} ${rowIndex + 1}`" /></td></tr></tbody></table></div>

    <div v-else-if="exercise.type === 'matching'" class="grid gap-3 sm:grid-cols-2"><div v-for="(item, index) in exercise.data.left" :key="item" class="flex min-h-14 items-center gap-2"><button :disabled="submitted" class="min-h-14 flex-1 rounded-2xl border-2 p-3 text-left font-bold" :class="selected === index ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-stone-50'" @click="chooseMatching('left', index)">{{ item }}</button><button v-if="exercise.grade <= 2" type="button" class="min-h-14 min-w-14 rounded-2xl bg-violet-50" :aria-label="`${item} vorlesen`" @click="readAloud(item)">🔊</button><span class="text-orange-500">→ {{ matchingRightLabel(index) }}</span></div><div class="sm:col-start-2"><div v-for="(item, index) in exercise.data.right" :key="item" class="mb-2 flex gap-1"><button :disabled="submitted" class="min-h-14 flex-1 rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 font-bold hover:border-orange-300" @click="chooseMatching('right', index)">{{ item }}</button><button v-if="exercise.grade <= 2" type="button" class="min-h-14 min-w-14 rounded-2xl bg-violet-50" :aria-label="`${item} vorlesen`" @click="readAloud(item)">🔊</button></div></div></div>

    <DraggableClockWidget v-else-if="exercise.type === 'clock-interactive'" v-model="clockValue" :target="exercise.data" :grade="exercise.grade" :disabled="submitted" @speak="readAloud" />

    <div v-else-if="exercise.type === 'grid-alignment'" class="mx-auto max-w-sm"><div class="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-center"><span /><span class="font-bold text-stone-600">Euro</span><span class="font-bold text-stone-600">Cent</span><span class="font-bold text-stone-600">1. Zahl</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ gridValue(0) }}</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ centsLabel(gridValue(1)) }}</span><span class="font-bold text-stone-600">2. Zahl</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ gridValue(2) }}</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ centsLabel(gridValue(3)) }}</span></div><div class="mt-4 grid grid-cols-[auto_1fr_1fr] items-center gap-2"><span class="font-bold text-stone-600">Ergebnis</span><input v-model="gridAnswer[0]" :disabled="submitted" class="min-h-14 w-full rounded-xl border-2 border-orange-200 bg-orange-50 text-center text-lg font-bold outline-none focus:border-orange-400" inputmode="decimal" aria-label="Ergebnis Euro" /><input v-model="gridAnswer[1]" :disabled="submitted" class="min-h-14 w-full rounded-xl border-2 border-orange-200 bg-orange-50 text-center text-lg font-bold outline-none focus:border-orange-400" inputmode="decimal" aria-label="Ergebnis Cent" /></div></div>

    <div v-else-if="exercise.type === 'shape-detective'" class="grid gap-3"><div v-if="exercise.data.properties.length" class="flex flex-wrap gap-2"><span v-for="property in exercise.data.properties" :key="property" class="rounded-full bg-violet-50 px-3 py-2 font-bold text-violet-800">{{ property }}</span></div><ShapeSelectWidget v-model="shapeSelection" :options="shapeOptions" :disabled="submitted" @speak="readAloud" /></div>
    <ComparisonWidget v-else-if="exercise.type === 'comparison'" v-model="comparisonSelection" :left="exercise.data.left" :right="exercise.data.right" :disabled="submitted" @speak="readAloud" />
    <MirrorGridWidget v-else-if="exercise.type === 'mirror-grid'" v-model="mirrorAnswer" :filled-indices="exercise.data.filledIndices" :disabled="submitted" @speak="readAloud" />

    <div v-else-if="exercise.type === 'spatial-grid'" class="mx-auto max-w-sm"><p class="mb-2 text-center font-bold text-stone-600">🔴 = roter Punkt · 🦉 = Eule</p><div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${exercise.data.columns}, minmax(0, 1fr))` }"><button v-for="index in spatialCells" :key="index" :disabled="submitted || index === exercise.data.referenceIndex || index === exercise.data.secondaryReferenceIndex" class="aspect-square min-h-14 min-w-14 rounded-lg border-2 text-2xl" :class="index === exercise.data.referenceIndex || index === exercise.data.secondaryReferenceIndex ? 'border-orange-400 bg-orange-100' : spatialAnswer === index ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-stone-50 hover:border-orange-300'" :aria-label="`Reihe ${Math.floor(index / exercise.data.columns) + 1}, Spalte ${index % exercise.data.columns + 1}`" @click="spatialAnswer = index">{{ index === exercise.data.referenceIndex || index === exercise.data.secondaryReferenceIndex ? exercise.data.reference : spatialAnswer === index ? '🦉' : '' }}</button></div></div>

    <div v-else-if="exercise.type === 'number-wall'" class="mx-auto max-w-sm"><div class="flex flex-col items-center gap-1"><div v-for="(row, rowIndex) in exercise.data.rows" :key="rowIndex" class="flex gap-1" :style="{ width: `${Math.max(1, row.length) * 4.5}rem` }"><template v-for="(value, columnIndex) in row" :key="`${rowIndex}-${columnIndex}`"><span v-if="value !== null" class="flex h-12 flex-1 items-center justify-center rounded-lg bg-stone-100 font-bold">{{ value }}</span><input v-else v-model="wallAnswer[wallBlankIndex(rowIndex, columnIndex)]" :disabled="submitted" class="h-12 min-w-0 flex-1 rounded-lg border-2 border-orange-200 bg-orange-50 text-center font-bold" inputmode="numeric" aria-label="Zahlenmauer Lücke" /></template></div></div></div>

    <div v-else-if="exercise.type === 'symmetry-grid'" class="mx-auto max-w-sm"><div class="relative grid gap-1" :style="{ gridTemplateColumns: `repeat(${exercise.data.columns}, minmax(0, 1fr))` }"><span class="pointer-events-none absolute inset-y-0 z-10 w-1 bg-violet-600" :style="{ left: `${((exercise.data.axisAfterColumn + 0.5) / exercise.data.columns) * 100}%`, transform: 'translateX(-50%)' }" aria-hidden="true" /><button v-for="index in symmetryCells" :key="index" :disabled="submitted || isSymmetrySource(index) || !isSymmetryTarget(index)" class="aspect-square rounded-lg border-2 text-lg" :class="isSymmetrySource(index) ? 'border-violet-500 bg-violet-400' : symmetryAnswer.includes(index) ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-stone-50 hover:border-orange-300'" @click="toggleSymmetryCell(index)">{{ isSymmetrySource(index) ? '●' : symmetryAnswer.includes(index) ? '●' : '' }}</button></div><p class="mt-2 text-center text-sm text-stone-500">Spiegelachse in Spalte {{ exercise.data.axisAfterColumn + 1 }}</p></div>

    <div class="mt-5 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex">
      <button v-if="!submitted" :disabled="!hasAnswer" class="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-orange-600" @click="submit"><Check :size="18" /> Prüfen</button>
      <button v-if="!submitted && exercise.hint" class="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-2 font-bold text-violet-700 hover:bg-violet-100" @click="showHint = !showHint"><HelpCircle :size="18" /> Tipp</button>
      <button v-if="submitted && showNext" class="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600" @click="emit('next')">Nächste Aufgabe <Check :size="18" /></button>
      <button v-if="submitted && !singleAttempt" class="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-xl bg-stone-100 px-4 py-2 font-bold text-stone-700 hover:bg-stone-200" @click="retry"><RotateCcw :size="18" /> Nochmal</button>
    </div>
    <p v-if="showHint && !submitted && exercise.hint" class="mt-3 rounded-2xl bg-violet-50 p-3 text-sm text-violet-800"><Sparkles class="mr-1 inline" :size="16" />{{ exercise.hint }}</p>
    <div v-if="submitted" :class="submittedCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'" class="mt-4 rounded-2xl p-4"><strong>{{ submittedCorrect ? 'Super, richtig! 🎉' : 'Knapp vorbei! Probier es noch einmal 💡' }}</strong><p v-if="resultMessage" class="mt-1 text-sm">{{ resultMessage }}</p><p v-else-if="exercise.explanation" class="mt-1 text-sm">{{ exercise.explanation }}</p></div>
  </article>
</template>

<style scoped>
@keyframes wobble { 20% { transform: translateX(-4px) rotate(-1deg); } 40% { transform: translateX(4px) rotate(1deg); } 60% { transform: translateX(-2px); } 80% { transform: translateX(2px); } }
.gentle-wobble { animation: wobble 400ms ease-in-out; }
@media (prefers-reduced-motion: reduce) { .gentle-wobble { animation: none; } }
</style>
