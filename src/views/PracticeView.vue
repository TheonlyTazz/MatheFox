<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, CheckCircle2, RotateCcw } from 'lucide-vue-next'
import CurriculumExerciseCard from '../components/CurriculumExerciseCard.vue'
import { generateSession, getGradeCatalog } from '../data/grades'
import { useProfileStore } from '../stores/profile'
import type { Exercise } from '../types/curriculum'

const props = defineProps<{ initialTopic?: string }>()
const profile = useProfileStore()
const catalog = getGradeCatalog(profile.currentGrade)
const activeTopics = computed(() => catalog.topics.filter((topic) => profile.activeTopicIds.includes(topic.id)))
if (activeTopics.value.length === 0) throw new Error('Wähle vor dem Üben mindestens ein Thema.')
if (props.initialTopic && !profile.activeTopicIds.includes(props.initialTopic)) throw new Error(`Das Thema ${props.initialTopic} ist nicht aktiv.`)

const selectedTopic = ref<string | undefined>(props.initialTopic)
const questions = ref<Exercise[]>([])
const index = ref(0)
const creditedIds = ref<Set<string>>(new Set())
const completed = ref(false)
const current = computed(() => {
  const exercise = questions.value[index.value]
  if (!exercise) throw new Error('Die Übungssitzung enthält keine aktuelle Aufgabe.')
  return exercise
})
const title = computed(() => {
  if (!selectedTopic.value) return 'Deine Tagesmission'
  const topic = activeTopics.value.find((item) => item.id === selectedTopic.value)
  if (!topic) throw new Error(`Das ausgewählte Thema ${selectedTopic.value} ist nicht aktiv.`)
  return topic.title
})

const startSession = (topicId?: string): void => {
  if (topicId && !profile.activeTopicIds.includes(topicId)) throw new Error(`Das Thema ${topicId} ist nicht aktiv.`)
  selectedTopic.value = topicId
  questions.value = generateSession(profile.currentGrade, topicId ? [topicId] : profile.activeTopicIds, topicId ? 6 : 10, Date.now())
  index.value = 0
  creditedIds.value = new Set()
  completed.value = false
}

const solved = (correct: boolean, credit: boolean): void => {
  if (!correct || !credit || creditedIds.value.has(current.value.id)) return
  creditedIds.value = new Set([...creditedIds.value, current.value.id])
  profile.award(current.value.topicId, current.value.xpReward)
}

const nextExercise = (): void => {
  if (index.value < questions.value.length - 1) {
    index.value += 1
    return
  }
  completed.value = true
  if (selectedTopic.value && creditedIds.value.size === questions.value.length) profile.completeTopic(selectedTopic.value)
}

startSession(props.initialTopic)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-6 md:py-12">
    <div class="mb-5"><p class="font-bold text-orange-500">Übungsmodus · Klasse {{ profile.currentGrade }}</p><h1 class="mt-1 text-3xl font-black text-stone-800 md:text-4xl">{{ title }}</h1></div>
    <div class="mb-6 flex snap-x gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Mathe-Themen">
      <button :aria-selected="selectedTopic === undefined" role="tab" class="min-h-12 shrink-0 rounded-full px-5 py-2 font-bold shadow-sm" :class="selectedTopic === undefined ? 'bg-orange-500 text-white' : 'bg-white text-stone-600'" @click="startSession()">🎯 Gemischt</button>
      <button v-for="topic in activeTopics" :key="topic.id" :aria-selected="selectedTopic === topic.id" role="tab" class="min-h-12 shrink-0 rounded-full px-5 py-2 font-bold shadow-sm" :class="selectedTopic === topic.id ? 'bg-orange-500 text-white' : 'bg-white text-stone-600'" @click="startSession(topic.id)">{{ topic.icon }} {{ topic.title }}</button>
    </div>
    <div v-if="completed" class="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
      <CheckCircle2 class="mx-auto text-emerald-500" :size="56" />
      <h2 class="mt-4 text-3xl font-black text-stone-800">Runde geschafft! 🎉</h2>
      <p class="mt-2 text-stone-600">Du hast {{ creditedIds.size }} von {{ questions.length }} Aufgaben gelöst.</p>
      <button class="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600" @click="startSession(selectedTopic)"><RotateCcw :size="18" /> Neue Runde</button>
    </div>
    <div v-else class="mx-auto max-w-3xl">
      <CurriculumExerciseCard :key="current.id" :exercise="current" @solved="solved" @next="nextExercise" />
      <p class="mt-5 flex items-center gap-2 text-sm text-stone-500"><BookOpen :size="17" /> Aufgabe {{ index + 1 }} von {{ questions.length }}</p>
    </div>
  </main>
</template>
