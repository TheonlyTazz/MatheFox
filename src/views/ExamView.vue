<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock, RotateCcw, Trophy } from 'lucide-vue-next'
import ExerciseCard from '../components/ExerciseCard.vue'
import { generateMixedExamSet } from '../data/generator'
import { testRegistry } from '../data/tests'
import { useProgressStore } from '../stores/progress'

const emit = defineEmits<{ home: [] }>()
const test = testRegistry[0]
if (!test) throw new Error('Es ist keine Prüfung registriert.')
const progress = useProgressStore()
const active = ref(0)
const answers = ref<Record<string, boolean>>({})
const awardedExerciseIds = new Set<string>()
const seconds = ref(test.durationMinutes * 60)
const finished = ref(false)
let timer: number | undefined
const examExercises = generateMixedExamSet(`${test.id}-${Date.now()}-${Math.random()}`, test.grade, test.exerciseIds.length)
const current = computed(() => examExercises[active.value])
const timeLabel = computed(() => `${String(Math.floor(seconds.value / 60)).padStart(2, '0')}:${String(seconds.value % 60).padStart(2, '0')}`)
const score = computed(() => Object.values(answers.value).filter(Boolean).length)
const finish = (): void => { finished.value = true; if (timer !== undefined) window.clearInterval(timer) }
const solved = (correct: boolean, credit: boolean): void => {
  if (!current.value) throw new Error('Exam has no current exercise.')
  answers.value[current.value.id] = correct
  if (correct && credit && !awardedExerciseIds.has(current.value.id)) {
    awardedExerciseIds.add(current.value.id)
    progress.award(current.value.topic, current.value.xp)
  }
}
onMounted(() => { timer = window.setInterval(() => { seconds.value -= 1; if (seconds.value <= 0) finish() }, 1000) })
onBeforeUnmount(() => { if (timer !== undefined) window.clearInterval(timer) })
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-6 sm:py-10">
    <div v-if="!finished && current" class="rounded-[1.5rem] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-8"><div class="mb-6 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between"><div><p class="font-bold text-violet-600">Probearbeit · {{ active + 1 }}/{{ examExercises.length }}</p><h1 class="text-2xl font-black leading-tight text-stone-800">{{ test.title }}</h1></div><div class="flex w-fit items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 font-black text-violet-700"><Clock :size="18" /> {{ timeLabel }}</div></div><ExerciseCard :key="current.id" :exercise="current" @solved="solved" /><div class="mt-5 grid grid-cols-1 gap-2 min-[420px]:flex min-[420px]:justify-between"><button :disabled="active === 0" class="min-h-11 rounded-xl px-4 py-2 font-bold text-stone-500 hover:bg-stone-100 disabled:opacity-40" @click="active = Math.max(0, active - 1)">Zurück</button><button v-if="active < examExercises.length - 1" class="min-h-11 rounded-xl bg-violet-600 px-5 py-2 font-bold text-white hover:bg-violet-700" @click="active++">Nächste</button><button v-else class="min-h-11 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700" @click="finish">Abgeben</button></div></div>
    <div v-else class="rounded-[2rem] bg-white p-8 text-center shadow-sm"><Trophy class="mx-auto text-amber-500" :size="58" /><h1 class="mt-4 text-3xl font-black text-stone-800">Geschafft!</h1><p class="mt-2 text-stone-500">Du hast {{ score }} von {{ examExercises.length }} Aufgaben richtig gelöst.</p><div class="mx-auto mt-6 max-w-xs rounded-2xl bg-amber-50 p-5"><strong class="text-4xl text-amber-600">{{ Math.round((score / examExercises.length) * 100) }}%</strong><p class="mt-1 text-sm text-amber-800">Dein Mathearbeit-Ergebnis</p></div><button class="mt-6 flex mx-auto items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white" @click="emit('home')"><RotateCcw :size="18" /> Zur Startseite</button></div>
  </main>
</template>
