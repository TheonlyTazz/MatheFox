<script setup lang="ts">
import { computed, ref } from 'vue'
import { Flame, Home, PencilLine, Settings, Trophy } from 'lucide-vue-next'
import { useProfileStore } from '../../stores/profile'
import TopicFilterModal from './TopicFilterModal.vue'

defineProps<{ active: 'home' | 'practice' | 'exam' }>()
const emit = defineEmits<{ navigate: [view: 'home' | 'practice' | 'exam']; scratchpad: [] }>()
const profile = useProfileStore()
const showSettings = ref(false)
const avatarEmojis: Record<string, string> = { owl: '🦉', fox: '🦊', cat: '🐱', robot: '🤖', bear: '🐻', dragon: '🐲' }
const avatarEmoji = computed(() => {
  const emoji = avatarEmojis[profile.avatar]
  if (emoji === undefined) throw new Error(`Unknown avatar: ${profile.avatar}`)
  return emoji
})
const canPractice = computed(() => profile.activeTopicIds.length > 0)
const canTakeExam = computed(() => profile.currentGrade === 4 && profile.activeTopicIds.length === profile.availableTopics.length)
const changeGrade = (grade: Parameters<typeof profile.switchGrade>[0]): void => { profile.switchGrade(grade) }
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-orange-100 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur"><div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-3 md:px-6"><button type="button" class="flex shrink-0 items-center gap-2 text-left" aria-label="Zur Startseite" @click="emit('navigate', 'home')"><span class="grid h-10 w-10 place-items-center rounded-2xl fox-gradient text-2xl shadow-sm">{{ avatarEmoji }}</span><span><strong class="block text-base text-orange-600 sm:text-lg">MatheFox</strong><small class="hidden text-xs text-stone-500 sm:block">Hallo, {{ profile.nickname }}!</small></span></button><nav class="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:pb-0" aria-label="Hauptnavigation"><button type="button" :class="active === 'home' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'home')"><Home :size="18" /><span>Start</span></button><button v-if="canPractice" type="button" :class="active === 'practice' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'practice')"><PencilLine :size="18" /><span>Üben</span></button><button v-if="canTakeExam" type="button" :class="active === 'exam' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'exam')"><Trophy :size="18" /><span>Test</span></button></nav><div class="ml-auto flex items-center gap-1"><span class="hidden rounded-full bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 sm:inline">⭐ {{ profile.xp }} XP</span><span class="hidden rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 sm:inline"><Flame :size="16" class="inline" /> {{ profile.dailyStreak }}</span><button type="button" class="rounded-full bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700" aria-label="Klasse wechseln" @click="showSettings = true">Klasse {{ profile.currentGrade }}</button><button type="button" class="flex min-h-11 items-center justify-center rounded-xl px-2 text-orange-700 hover:bg-orange-50" aria-label="Schmierzettel öffnen" @click="emit('scratchpad')"><PencilLine :size="19" /><span class="hidden md:inline">Schmierzettel</span></button><button type="button" class="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-orange-700 hover:bg-orange-50" aria-label="Themen anpassen" @click="showSettings = true"><Settings :size="20" /></button></div></div></header><TopicFilterModal :open="showSettings" @close="showSettings = false" @switch-grade="changeGrade" /></template>
<style scoped>
header span.hidden { display: inline-flex; }
header small.hidden { display: block; }
</style>
