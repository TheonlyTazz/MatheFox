<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, ClipboardPenLine, Pencil } from 'lucide-vue-next'
import ExerciseCard from '../components/ExerciseCard.vue'
import Scratchpad from '../components/Scratchpad.vue'
import { exercises } from '../data/exercises'
import { topics, topicByKey } from '../data/topics'
import { useProgressStore } from '../stores/progress'
import type { TopicKey } from '../types/math'

const props = defineProps<{ initialTopic?: TopicKey }>()
const selected = ref<TopicKey>(props.initialTopic ?? 'klammern')
const index = ref(0)
const scratchpad = ref(false)
const progress = useProgressStore()
const currentExercises = computed(() => exercises.filter((item) => item.topic === selected.value))
const current = computed(() => currentExercises.value[index.value % currentExercises.value.length])
const topic = computed(() => topicByKey(selected.value))
const solved = (correct: boolean, credit: boolean): void => { if (correct && credit) progress.award(selected.value, current.value.xp) }
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p class="font-bold text-orange-500">Übungsmodus</p><h1 class="text-3xl font-black text-stone-800">{{ topic.emoji }} {{ topic.title }}</h1></div><button class="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-violet-700 shadow-sm" @click="scratchpad = true"><Pencil :size="18" /> Schmierblatt</button></div>
    <div class="mb-6 flex gap-2 overflow-auto pb-2" role="tablist" aria-label="Mathe-Themen">
      <button v-for="item in topics" :id="`tab-${item.key}`" :key="item.key" :aria-controls="`panel-${item.key}`" :aria-selected="selected === item.key" role="tab" :tabindex="selected === item.key ? 0 : -1" :class="selected === item.key ? 'bg-orange-500 text-white' : 'bg-white text-stone-600'" class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold shadow-sm" @click="selected = item.key; index = 0">{{ item.emoji }} {{ item.title }}</button>
    </div>
    <div :id="`panel-${selected}`" class="mx-auto max-w-3xl" role="tabpanel" :aria-labelledby="`tab-${selected}`"><ExerciseCard :key="current.id" :exercise="current" @solved="solved" /><div class="mt-5 flex items-center justify-between text-sm text-stone-500"><span class="flex items-center gap-2"><BookOpen :size="17" /> Aufgabe {{ (index % currentExercises.length) + 1 }} von {{ currentExercises.length }}</span><button class="flex items-center gap-2 font-bold text-orange-600" @click="index++">Nächste Aufgabe <ClipboardPenLine :size="17" /></button></div></div>
    <Scratchpad v-if="scratchpad" @close="scratchpad = false" />
  </main>
</template>
