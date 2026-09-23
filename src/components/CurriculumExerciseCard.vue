<script setup lang="ts">
import { Check, HelpCircle, RotateCcw, Sparkles } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type {
  ClockInteractiveData,
  Exercise,
  ExerciseAnswer,
  GridAlignmentData,
  MatchingData,
  NumberInputData,
  ShapeDetectiveData,
  TableFillData,
} from '../types/curriculum'

const props = withDefaults(defineProps<{
  exercise: Exercise
  singleAttempt?: boolean
  showNext?: boolean
}>(), { singleAttempt: false, showNext: true })

const emit = defineEmits<{ solved: [correct: boolean, credit: boolean]; next: [] }>()

const submitted = ref(false)
const credited = ref(false)
const showHint = ref(false)
const selected = ref<string | number | null>(null)
const numberAnswer = ref('')
const tableAnswer = ref<Array<string | number>>([])
const matchingAnswer = ref<number[]>([])
const gridAnswer = ref<string[]>([])
const selectedHour = ref(1)
const selectedMinute = ref(0)
const resultMessage = ref('')
const submittedCorrect = ref(false)

const numberData = computed<NumberInputData | null>(() => props.exercise.type === 'number-input' ? props.exercise.data : null)
const tableData = computed<TableFillData | null>(() => props.exercise.type === 'table-fill' ? props.exercise.data : null)
const matchingData = computed<MatchingData | null>(() => props.exercise.type === 'matching' ? props.exercise.data : null)
const clockData = computed<ClockInteractiveData | null>(() => props.exercise.type === 'clock-interactive' ? props.exercise.data : null)
const gridData = computed<GridAlignmentData | null>(() => props.exercise.type === 'grid-alignment' ? props.exercise.data : null)

const shapeLabels: Record<ShapeDetectiveData['shape'], string> = {
  circle: 'Kreis', triangle: 'Dreieck', square: 'Quadrat', rectangle: 'Rechteck',
  cube: 'Würfel', sphere: 'Kugel', cuboid: 'Quader',
}
const shapeChoices: readonly ShapeDetectiveData['shape'][] = ['circle', 'triangle', 'square', 'rectangle', 'cube', 'sphere', 'cuboid']

const tableCells = computed(() => {
  const data = tableData.value
  if (!data) return []
  return data.rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => ({ value, rowIndex, columnIndex })))
})
const blankTableCells = computed(() => tableCells.value.filter((cell) => cell.value === null))
const tableValues = computed(() => tableAnswer.value)
const tableBlankIndex = (rowIndex: number, columnIndex: number): number => blankTableCells.value.findIndex((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex)
const matchingReady = computed(() => Boolean(matchingData.value) && matchingAnswer.value.length === matchingData.value?.left.length && matchingAnswer.value.every((item) => item >= 0))
const gridReady = computed(() => Boolean(gridData.value) && gridAnswer.value.length === gridData.value?.answers.length && gridAnswer.value.every((item) => item.trim() !== ''))
const hasAnswer = computed(() => {
  switch (props.exercise.type) {
    case 'number-input': return numberAnswer.value.trim() !== ''
    case 'multiple-choice': return typeof selected.value === 'string'
    case 'table-fill': return tableValues.value.length > 0 && tableValues.value.every((item) => String(item).trim() !== '')
    case 'matching': return matchingReady.value
    case 'clock-interactive': return true
    case 'grid-alignment': return gridReady.value
    case 'shape-detective': return typeof selected.value === 'string'
  }
})

const clockStyle = computed(() => {
  const hourAngle = (selectedHour.value % 12) * 30 + selectedMinute.value * 0.5
  const minuteAngle = selectedMinute.value * 6
  return { '--hour-angle': `${hourAngle}deg`, '--minute-angle': `${minuteAngle}deg` }
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
  }
}

const submit = (): void => {
  if (submitted.value || !hasAnswer.value) return
  const correct = validateAnswer(answerForExercise())
  submittedCorrect.value = correct
  submitted.value = true
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
    selectedMinute.value = (exercise.data.minute + 5) % 60
  }
}
initialise()
</script>

<template>
  <article class="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div><span class="text-xs font-bold uppercase tracking-wider text-orange-500">Aufgabe</span><h2 class="mt-1 text-xl font-extrabold leading-tight text-stone-800 md:text-2xl">{{ exercise.title }}</h2><p class="mt-2 text-stone-600">{{ exercise.instruction }}</p></div>
      <span class="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">+{{ exercise.xpReward }} XP</span>
    </div>

    <div v-if="exercise.type === 'number-input'" class="flex items-center gap-3">
      <input v-model="numberAnswer" :disabled="submitted" inputmode="decimal" aria-label="Deine Antwort" class="min-h-14 min-w-0 flex-1 rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 text-xl outline-none focus:border-orange-400" placeholder="Deine Antwort ..." @keyup.enter="submit" />
      <span v-if="numberData?.unit" class="font-bold text-stone-600">{{ numberData.unit }}</span>
    </div>

    <div v-else-if="exercise.type === 'multiple-choice'" class="grid gap-3 sm:grid-cols-2">
      <button v-for="option in exercise.data.options" :key="option" :disabled="submitted" class="min-h-14 rounded-2xl border-2 p-3 text-left font-bold transition" :class="selected === option ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-stone-50 hover:border-orange-300'" @click="selected = option">{{ option }}</button>
    </div>

    <div v-else-if="exercise.type === 'table-fill'" class="overflow-x-auto"><table class="w-full min-w-[18rem] border-separate border-spacing-2"><thead><tr><th v-for="header in exercise.data.headers" :key="header" class="rounded-xl bg-orange-50 p-3 text-left text-sm text-orange-800">{{ header }}</th></tr></thead><tbody><tr v-for="(row, rowIndex) in exercise.data.rows" :key="rowIndex"><td v-for="(value, columnIndex) in row" :key="columnIndex"><span v-if="value !== null" class="flex min-h-12 items-center justify-center rounded-xl bg-stone-100 px-3 font-bold text-stone-700">{{ value }}</span><input v-else v-model="tableAnswer[tableBlankIndex(rowIndex, columnIndex)]" :disabled="submitted" class="min-h-12 w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-3 text-center font-bold outline-none focus:border-orange-400" inputmode="decimal" :aria-label="`${exercise.data.headers[columnIndex]} ${rowIndex + 1}`" /></td></tr></tbody></table></div>

    <div v-else-if="exercise.type === 'matching'" class="grid gap-3 sm:grid-cols-2"><div v-for="(item, index) in exercise.data.left" :key="item" class="flex min-h-14 items-center gap-2"><button :disabled="submitted" class="flex-1 rounded-2xl border-2 p-3 text-left font-bold" :class="selected === index ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-stone-50'" @click="chooseMatching('left', index)">{{ item }}</button><span class="text-orange-500">→ {{ matchingRightLabel(index) }}</span></div><div class="sm:col-start-2"><button v-for="(item, index) in exercise.data.right" :key="item" :disabled="submitted" class="mr-2 mb-2 min-h-12 rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 font-bold hover:border-orange-300" @click="chooseMatching('right', index)">{{ item }}</button></div></div>

    <div v-else-if="exercise.type === 'clock-interactive'" class="flex flex-col items-center gap-5 sm:flex-row sm:justify-center"><div class="clock-face" :style="clockStyle" aria-label="Analoge Uhr"><span v-for="hour in 12" :key="hour" class="clock-number" :style="{ transform: `rotate(${hour * 30}deg) translateY(-5.6rem) rotate(-${hour * 30}deg)` }">{{ hour }}</span><i class="clock-hand clock-hour" /><i class="clock-hand clock-minute" /></div><div class="flex items-center gap-2"><label class="font-bold">Stunde <select v-model.number="selectedHour" :disabled="submitted" class="min-h-12 rounded-xl border-2 border-stone-200 px-3"><option v-for="hour in 12" :key="hour" :value="hour">{{ hour }}</option></select></label><label class="font-bold">Minute <select v-model.number="selectedMinute" :disabled="submitted" class="min-h-12 rounded-xl border-2 border-stone-200 px-3"><option v-for="minute in 60" :key="minute" :value="minute - 1">{{ String(minute - 1).padStart(2, '0') }}</option></select></label></div></div>

    <div v-else-if="exercise.type === 'grid-alignment'" class="mx-auto max-w-sm"><div class="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-center"><span /><span class="font-bold text-stone-600">Euro</span><span class="font-bold text-stone-600">Cent</span><span class="font-bold text-stone-600">1. Zahl</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ gridValue(0) }}</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ centsLabel(gridValue(1)) }}</span><span class="font-bold text-stone-600">2. Zahl</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ gridValue(2) }}</span><span class="rounded-xl bg-stone-100 p-3 text-lg font-bold text-stone-700">{{ centsLabel(gridValue(3)) }}</span></div><div class="mt-4 grid grid-cols-[auto_1fr_1fr] items-center gap-2"><span class="font-bold text-stone-600">Ergebnis</span><input v-model="gridAnswer[0]" :disabled="submitted" class="min-h-14 w-full rounded-xl border-2 border-orange-200 bg-orange-50 text-center text-lg font-bold outline-none focus:border-orange-400" inputmode="decimal" aria-label="Ergebnis Euro" /><input v-model="gridAnswer[1]" :disabled="submitted" class="min-h-14 w-full rounded-xl border-2 border-orange-200 bg-orange-50 text-center text-lg font-bold outline-none focus:border-orange-400" inputmode="decimal" aria-label="Ergebnis Cent" /></div></div>

    <div v-else-if="exercise.type === 'shape-detective'" class="grid gap-3 sm:grid-cols-2"><div class="sm:col-span-2 flex flex-wrap gap-2"> <span v-for="property in exercise.data.properties" :key="property" class="rounded-full bg-violet-50 px-3 py-2 font-bold text-violet-800">{{ property }}</span></div><button v-for="shape in shapeChoices" :key="shape" :disabled="submitted" class="min-h-14 rounded-2xl border-2 p-3 text-left font-bold" :class="selected === shapeLabels[shape] ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-stone-50 hover:border-orange-300'" @click="selected = shapeLabels[shape]">{{ shapeLabels[shape] }}</button></div>

    <div class="mt-5 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex">
      <button v-if="!submitted" :disabled="!hasAnswer" class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-orange-600" @click="submit"><Check :size="18" /> Prüfen</button>
      <button v-if="!submitted && exercise.hint" class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-2 font-bold text-violet-700 hover:bg-violet-100" @click="showHint = !showHint"><HelpCircle :size="18" /> Tipp</button>
      <button v-if="submitted && showNext" class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600" @click="emit('next')">Nächste Aufgabe <Check :size="18" /></button>
      <button v-if="submitted && !singleAttempt" class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-stone-100 px-4 py-2 font-bold text-stone-700 hover:bg-stone-200" @click="retry"><RotateCcw :size="18" /> Nochmal</button>
    </div>
    <p v-if="showHint && !submitted && exercise.hint" class="mt-3 rounded-2xl bg-violet-50 p-3 text-sm text-violet-800"><Sparkles class="mr-1 inline" :size="16" />{{ exercise.hint }}</p>
    <div v-if="submitted" :class="submittedCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'" class="mt-4 rounded-2xl p-4"><strong>{{ submittedCorrect ? 'Super, richtig! 🎉' : 'Knapp vorbei! Probier es noch einmal 💡' }}</strong><p v-if="resultMessage" class="mt-1 text-sm">{{ resultMessage }}</p><p v-else-if="exercise.explanation" class="mt-1 text-sm">{{ exercise.explanation }}</p></div>
  </article>
</template>

<style scoped>
.clock-face { position: relative; width: 13rem; height: 13rem; border: 0.45rem solid #fdba74; border-radius: 50%; background: #fff7ed; }
.clock-number { position: absolute; left: calc(50% - 0.7rem); top: calc(50% - 0.7rem); width: 1.4rem; height: 1.4rem; text-align: center; font-weight: 800; color: #7c2d12; }
.clock-hand { position: absolute; left: calc(50% - 0.13rem); bottom: 50%; width: 0.26rem; border-radius: 999px; transform-origin: 50% 100%; transform: rotate(var(--hour-angle)); background: #9a3412; }
.clock-hour { height: 3.6rem; }
.clock-minute { height: 5rem; width: 0.18rem; transform: rotate(var(--minute-angle)); background: #f97316; }
</style>
