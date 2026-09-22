<script setup lang="ts">
import { Check, HelpCircle, RotateCcw, Sparkles } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { Exercise } from '../types/math'

const props = defineProps<{ exercise: Exercise; compact?: boolean }>()
const emit = defineEmits<{ solved: [correct: boolean, credit: boolean] }>()
const answer = ref('')
const submitted = ref(false)
const showHint = ref(false)
const credited = ref(false)
const isCorrect = computed(() => props.exercise.validate(answer.value))
const submit = (): void => {
  submitted.value = true
  if (isCorrect.value && !credited.value) {
    credited.value = true
    emit('solved', true, true)
  } else {
    emit('solved', isCorrect.value, false)
  }
}
const retry = (): void => { answer.value = ''; submitted.value = false; showHint.value = false }
</script>

<template>
  <article class="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-start justify-between gap-3"><div><span class="text-xs font-bold uppercase tracking-wider text-orange-500">Aufgabe</span><h2 class="mt-1 text-xl font-extrabold text-stone-800">{{ exercise.prompt }}</h2></div><span class="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">+{{ exercise.xp }} XP</span></div>
    <div v-if="exercise.options" class="grid gap-2 sm:grid-cols-3">
      <button v-for="option in exercise.options" :key="option" :disabled="submitted" :class="answer === option ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-stone-50'" class="rounded-2xl border-2 p-3 text-left font-bold hover:border-orange-300" @click="answer = option">{{ option }}</button>
    </div>
    <input v-else v-model="answer" :disabled="submitted" :aria-label="exercise.prompt" class="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3 text-lg outline-none focus:border-orange-400" placeholder="Deine Antwort ..." @keyup.enter="submit" />
    <div class="mt-4 flex flex-wrap gap-2">
      <button v-if="!submitted" :disabled="!answer" class="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-orange-600" @click="submit"><Check :size="18" /> Prüfen</button>
      <button v-if="!submitted" class="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 font-bold text-violet-700 hover:bg-violet-100" @click="showHint = !showHint"><HelpCircle :size="18" /> Tipp</button>
      <button v-if="submitted" class="flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 font-bold text-stone-700 hover:bg-stone-200" @click="retry"><RotateCcw :size="18" /> Nochmal</button>
    </div>
    <p v-if="showHint && !submitted" class="mt-3 rounded-2xl bg-violet-50 p-3 text-sm text-violet-800"><Sparkles class="mr-1 inline" :size="16" />{{ exercise.hint }}</p>
    <div v-if="submitted" :class="isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'" class="mt-4 rounded-2xl p-4">
      <strong>{{ isCorrect ? 'Super, richtig! 🎉' : 'Fast! Schau dir die Erklärung an.' }}</strong>
      <p class="mt-1 text-sm">{{ exercise.explanation }}</p>
    </div>
  </article>
</template>
