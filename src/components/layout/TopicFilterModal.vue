<script setup lang="ts">
import { computed } from 'vue'
import { useProfileStore } from '../../stores/profile'
import { useSpeech } from '../../composables/useSpeech'
import SpeechVoiceSetup from '../SpeechVoiceSetup.vue'
import type { GradeLevel } from '../../types/curriculum'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; switchGrade: [grade: GradeLevel] }>()
const profile = useProfileStore()
const { isInstalled: speechInstalled } = useSpeech()
const topics = computed(() => profile.availableTopics)
const grades: readonly GradeLevel[] = [1, 2, 3, 4]
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 grid place-items-center bg-stone-950/30 p-4 backdrop-blur-sm" @click.self="emit('close')">
    <section class="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="topics-title">
      <div class="flex items-start justify-between gap-4"><div><h2 id="topics-title" class="text-2xl font-black text-stone-800">Themen anpassen</h2><p class="text-sm text-stone-500">Klasse {{ profile.currentGrade }}</p></div><button type="button" class="rounded-xl px-3 py-2 text-xl text-stone-500 hover:bg-stone-100" aria-label="Schließen" @click="emit('close')">×</button></div>
      <div class="mt-5 grid gap-2 sm:grid-cols-2"><button v-for="topic in topics" :key="topic.id" type="button" class="flex items-center gap-2 rounded-2xl border-2 p-3 text-left" :class="profile.activeTopicIds.includes(topic.id) ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100'" @click="profile.toggleTopic(topic.id)"><span class="text-xl">{{ topic.icon }}</span><span class="min-w-0 flex-1 text-sm font-bold">{{ topic.title }}</span><span>{{ profile.activeTopicIds.includes(topic.id) ? '✅' : '⬜' }}</span></button></div>
      <div class="mt-4 flex gap-2"><button type="button" class="rounded-xl bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700" @click="profile.selectAllTopics">Alle</button><button type="button" class="rounded-xl bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700" @click="profile.deselectAllTopics">Keine</button></div>
      <SpeechVoiceSetup class="mt-5" />
      <label class="mt-2 flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-violet-50 px-4 py-3 font-bold text-violet-900"><span>🔊 Fragen automatisch vorlesen</span><input type="checkbox" class="h-6 w-6 accent-violet-600" :disabled="!speechInstalled" :checked="profile.autoReadQuestions" @change="profile.setAutoReadQuestions(($event.target as HTMLInputElement).checked)" /></label>
      <label class="mt-2 flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3 font-bold text-orange-900"><span>🎵 Klänge bei Aktionen</span><input type="checkbox" class="h-6 w-6 accent-orange-600" :checked="profile.soundEffectsEnabled" @change="profile.setSoundEffectsEnabled(($event.target as HTMLInputElement).checked)" /></label>
      <hr class="my-5 border-orange-100" /><p class="mb-2 text-sm font-bold text-stone-700">Klasse wechseln</p><div class="grid grid-cols-4 gap-2"><button v-for="grade in grades" :key="grade" type="button" class="rounded-xl border-2 px-2 py-3 font-black" :class="profile.currentGrade === grade ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-100'" @click="emit('switchGrade', grade)">Klasse {{ grade }}</button></div>
      <button type="button" class="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600" @click="emit('close')">Fertig</button>
    </section>
  </div>
</template>
