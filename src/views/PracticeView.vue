<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, ClipboardPenLine, Pencil } from 'lucide-vue-next'
import ExerciseCard from '../components/ExerciseCard.vue'
import Scratchpad from '../components/Scratchpad.vue'
import { generateRandomSession } from '../data/generator'
import { topics, topicByKey } from '../data/topics'
import { useProgressStore } from '../stores/progress'
import type { Exercise, TopicKey } from '../types/math'

const props = defineProps<{ initialTopic?: TopicKey }>()
const selected = ref<TopicKey>(props.initialTopic ?? 'klammern')
const session = ref<Exercise[]>([])
const index = ref(0)
const scratchpad = ref(false)
const progress = useProgressStore()
const current = computed(() => {
  const exercise = session.value[index.value]
  if (!exercise) throw new Error('Die Übungssitzung enthält keine aktuelle Aufgabe.')
  return exercise
})
const topic = computed(() => topicByKey(selected.value))
const startSession = (topicKey: TopicKey): void => {
  session.value = generateRandomSession({ topic: topicKey, count: 6, grade: 4 })
  index.value = 0
}
const nextExercise = (): void => {
  if (index.value < session.value.length - 1) {
    index.value += 1
    return
  }
  startSession(selected.value)
}
const solved = (correct: boolean, credit: boolean): void => {
  if (correct && credit) progress.award(current.value.topic, current.value.xp)
}
startSession(selected.value)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <div class="mb-5 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between"><div><p class="font-bold text-orange-500">Übungsmodus</p><h1 class="text-3xl font-black text-stone-800">{{ topic.emoji }} {{ topic.title }}</h1></div><button class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-violet-700 shadow-sm" @click="scratchpad = true"><Pencil :size="18" /> Schmierblatt</button></div>
    <div class="mb-6 flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2" role="tablist" aria-label="Mathe-Themen">
      <button v-for="item in topics" :id="`tab-${item.key}`" :key="item.key" :aria-controls="`panel-${item.key}`" :aria-selected="selected === item.key" role="tab" :tabindex="selected === item.key ? 0 : -1" :class="selected === item.key ? 'bg-orange-500 text-white' : 'bg-white text-stone-600'" class="min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold shadow-sm" @click="selected = item.key; startSession(item.key)">{{ item.emoji }} {{ item.title }}</button>
    </div>
    <div :id="`panel-${selected}`" class="mx-auto max-w-3xl" role="tabpanel" :aria-labelledby="`tab-${selected}`"><ExerciseCard :key="current.id" :exercise="current" @solved="solved" /><div class="mt-5 flex flex-col gap-3 text-sm text-stone-500 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"><span class="flex items-center gap-2"><BookOpen :size="17" /> Aufgabe {{ index + 1 }} von {{ session.length }}</span><button class="flex min-h-11 items-center justify-center gap-2 font-bold text-orange-600 min-[420px]:justify-end" @click="nextExercise">Nächste Aufgabe <ClipboardPenLine :size="17" /></button></div></div>
    <Scratchpad v-if="scratchpad" @close="scratchpad = false" />
  </main>
</template>
