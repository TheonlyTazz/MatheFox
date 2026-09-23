<script setup lang="ts">
import { computed, ref } from 'vue'
import confetti from 'canvas-confetti'
import { playBeep } from '../../services/audio'
import { getGradeCatalog } from '../../data/grades'
import { useProfileStore } from '../../stores/profile'
import type { GradeLevel } from '../../types/curriculum'

const profile = useProfileStore()
const step = ref(1)
const nickname = ref(profile.nickname)
const avatar = ref(profile.avatar)
const grade = ref<GradeLevel>(profile.currentGrade)
const selectedTopics = ref<string[]>([])
const avatars = [{ id: 'owl', emoji: '🦉', label: 'Eule' }, { id: 'fox', emoji: '🦊', label: 'Fuchs' }, { id: 'cat', emoji: '🐱', label: 'Katze' }, { id: 'robot', emoji: '🤖', label: 'Roboter' }, { id: 'bear', emoji: '🐻', label: 'Bär' }, { id: 'dragon', emoji: '🐲', label: 'Drache' }]
const gradeHints: Record<GradeLevel, string> = { 1: 'Zahlen bis 20 & Plus/Minus', 2: 'Einmaleins & Zahlen bis 100', 3: 'Große Zahlen & schriftliches Rechnen', 4: 'Kommas, Geometrie & Sachaufgaben' }
const topics = computed(() => getGradeCatalog(grade.value).topics)

const chooseGrade = (value: GradeLevel): void => { grade.value = value; selectedTopics.value = topics.value.map((topic) => topic.id) }
const next = (): void => {
  if (step.value === 2 && selectedTopics.value.length === 0) selectedTopics.value = topics.value.map((topic) => topic.id)
  step.value = Math.min(3, step.value + 1)
}
const previous = (): void => { step.value = Math.max(1, step.value - 1) }
const toggle = (id: string): void => { selectedTopics.value = selectedTopics.value.includes(id) ? selectedTopics.value.filter((topicId) => topicId !== id) : [...selectedTopics.value, id] }
const selectAll = (): void => { selectedTopics.value = topics.value.map((topic) => topic.id) }
const basicTopicIds: Record<GradeLevel, readonly string[]> = {
  1: ['g1_addition_subtraktion'],
  2: ['g2_einmaleins', 'g2_halbschriftlich'],
  3: ['g3_schriftlich_plus_minus', 'g3_multiplikation_division'],
  4: ['g4_klammern_punkt_strich', 'g4_schriftlich_komma', 'g4_schriftlich_mult_div'],
}
const basicOnly = (): void => { selectedTopics.value = topics.value.map((topic) => topic.id).filter((id) => basicTopicIds[grade.value].includes(id)) }
const finish = (): void => {
  profile.completeWizard({ nickname: nickname.value, avatar: avatar.value, currentGrade: grade.value, activeTopicIds: selectedTopics.value })
  playBeep(880, 0.14)
  void confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } })
}
</script>

<template>
  <main class="fixed inset-0 z-50 grid place-items-center bg-orange-950/30 p-4 backdrop-blur-sm">
    <section class="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-8" aria-labelledby="wizard-title">
      <div class="mb-6 flex items-center justify-between"><span class="text-sm font-bold text-orange-600">Schritt {{ step }} von 3</span><div class="flex gap-1" aria-hidden="true"><span v-for="index in 3" :key="index" class="h-2 w-10 rounded-full" :class="index <= step ? 'bg-orange-500' : 'bg-orange-100'" /></div></div>
      <div v-if="step === 1"><h1 id="wizard-title" class="mb-2 text-3xl font-black text-stone-800">Wer bist du? 👋</h1><p class="mb-6 text-stone-600">Ein Spitzname genügt – du kannst sofort loslegen.</p><label class="mb-5 block text-sm font-bold text-stone-700">Dein Name<input v-model="nickname" class="mt-2 w-full rounded-2xl border-2 border-orange-100 px-4 py-3" maxlength="24" placeholder="Mathe-Held" /></label><p class="mb-2 text-sm font-bold text-stone-700">Dein Avatar</p><div class="grid grid-cols-3 gap-2 sm:grid-cols-6"><button v-for="item in avatars" :key="item.id" type="button" class="rounded-2xl border-2 p-3 text-center" :class="avatar === item.id ? 'border-orange-500 bg-orange-50' : 'border-stone-100'" @click="avatar = item.id"><span class="block text-3xl">{{ item.emoji }}</span><span class="text-xs font-bold">{{ item.label }}</span></button></div></div>
      <div v-else-if="step === 2"><h1 id="wizard-title" class="mb-2 text-3xl font-black text-stone-800">In welche Klasse gehst du? 🎒</h1><p class="mb-6 text-stone-600">Wähle deine Klassenstufe aus.</p><div class="grid gap-3 sm:grid-cols-2"><button v-for="value in [1, 2, 3, 4] as GradeLevel[]" :key="value" type="button" class="rounded-2xl border-2 p-5 text-left" :class="grade === value ? 'border-orange-500 bg-orange-50' : 'border-stone-100'" @click="chooseGrade(value)"><span class="text-xl font-black text-orange-600">Klasse {{ value }}</span><span class="mt-1 block text-sm text-stone-600">{{ gradeHints[value] }}</span></button></div></div>
      <div v-else><h1 id="wizard-title" class="mb-2 text-3xl font-black text-stone-800">Was möchtest du üben? 🧩</h1><p class="mb-4 text-stone-600">Alle Themen sind schon ausgewählt.</p><div class="mb-4 flex flex-wrap gap-2"><button type="button" class="rounded-xl bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700" @click="selectAll">Alle auswählen</button><button type="button" class="rounded-xl bg-violet-100 px-3 py-2 text-sm font-bold text-violet-700" @click="basicOnly">Nur Grundrechnen</button></div><div class="grid max-h-[45vh] gap-2 overflow-y-auto sm:grid-cols-2"><button v-for="topic in topics" :key="topic.id" type="button" class="flex items-center gap-3 rounded-2xl border-2 p-3 text-left" :class="selectedTopics.includes(topic.id) ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100'" @click="toggle(topic.id)"><span class="text-2xl">{{ topic.icon }}</span><span><strong class="block">{{ topic.title }}</strong><small class="text-stone-500">{{ topic.description }}</small></span><span class="ml-auto text-xl">{{ selectedTopics.includes(topic.id) ? '✅' : '⬜' }}</span></button></div></div>
      <div class="mt-7 flex justify-between gap-3"><button v-if="step > 1" type="button" class="rounded-2xl px-5 py-3 font-bold text-stone-500 hover:bg-stone-100" @click="previous">Zurück</button><span v-else /><button v-if="step < 3" type="button" class="rounded-2xl bg-orange-500 px-6 py-3 font-black text-white shadow-sm hover:bg-orange-600" @click="next">Weiter</button><button v-else type="button" class="rounded-2xl bg-orange-500 px-6 py-3 font-black text-white shadow-sm hover:bg-orange-600" @click="finish">Los geht's ins Abenteuer! 🚀</button></div>
    </section>
  </main>
</template>
