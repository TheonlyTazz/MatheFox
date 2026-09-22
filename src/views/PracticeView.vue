<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, Pencil } from 'lucide-vue-next'
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
const submittedExerciseIds = ref<Set<string>>(new Set())
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
  submittedExerciseIds.value = new Set()
}
const nextTopic = (topicKey: TopicKey): TopicKey => {
  const topicIndex = topics.findIndex((item) => item.key === topicKey)
  return topics[(topicIndex + 1) % topics.length].key
}
const nextExercise = (): void => {
  if (index.value < session.value.length - 1) {
    index.value += 1
    return
  }
  const followingTopic = nextTopic(selected.value)
  selected.value = followingTopic
  startSession(followingTopic)
}
const solved = (correct: boolean, credit: boolean): void => {
  if (correct && credit) progress.award(current.value.topic, current.value.xp)
  if (submittedExerciseIds.value.has(current.value.id)) return
  submittedExerciseIds.value = new Set([...submittedExerciseIds.value, current.value.id])
  if (submittedExerciseIds.value.size === session.value.length) {
    progress.completeTopic(selected.value)
    nextExercise()
  }
}
startSession(selected.value)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-6 md:py-12">
    <div class="mb-5 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between md:mb-7"><div><p class="font-bold text-orange-500">Übungsmodus</p><h1 class="text-3xl font-black text-stone-800 md:text-4xl">{{ topic.emoji }} {{ topic.title }}</h1></div><button class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-violet-700 shadow-sm md:px-5" @click="scratchpad = true"><Pencil :size="18" /> Schmierblatt</button></div>
    <div class="mb-6 flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2 md:mb-8 md:gap-3" role="tablist" aria-label="Mathe-Themen">
      <button v-for="item in topics" :id="`tab-${item.key}`" :key="item.key" :aria-controls="`panel-${item.key}`" :aria-selected="selected === item.key" role="tab" :tabindex="selected === item.key ? 0 : -1" :class="selected === item.key ? 'bg-orange-500 text-white' : 'bg-white text-stone-600'" class="min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold shadow-sm" @click="selected = item.key; startSession(item.key)">{{ item.emoji }} {{ item.title }}</button>
    </div>
    <div :id="`panel-${selected}`" class="mx-auto max-w-3xl md:max-w-4xl" role="tabpanel" :aria-labelledby="`tab-${selected}`"><ExerciseCard :key="current.id" :exercise="current" :show-next="submittedExerciseIds.has(current.id) && index < session.length - 1" @solved="solved" @next="nextExercise" /><div class="mt-5 flex items-center text-sm text-stone-500 md:mt-6"><span class="flex items-center gap-2"><BookOpen :size="17" /> Aufgabe {{ index + 1 }} von {{ session.length }}</span></div></div>
    <Scratchpad v-if="scratchpad" @close="scratchpad = false" />
  </main>
</template>
