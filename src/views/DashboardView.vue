<script setup lang="ts">
import { computed } from 'vue'
import { CalendarCheck, CalendarClock, ChevronRight, Flame, Star, Target } from 'lucide-vue-next'
import { topics } from '../data/topics'
import { testRegistry } from '../data/tests'
import { useProgressStore } from '../stores/progress'
import { useDailyChallengeStore } from '../stores/dailyChallenge'
import type { TopicKey } from '../types/math'

const emit = defineEmits<{ practice: [topic?: TopicKey]; exam: []; daily: [] }>()
const progress = useProgressStore()
const daily = useDailyChallengeStore()
daily.syncToToday()
const exam = testRegistry[0]
const daysUntil = computed(() => Math.max(0, Math.ceil((new Date(exam.date).getTime() - Date.now()) / 86400000)))
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <section class="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div class="fox-gradient rounded-[2rem] p-6 text-white shadow-lg sm:p-8"><p class="font-bold text-orange-100">Hallo, Mathe-Fuchs! 👋</p><h1 class="mt-2 text-3xl font-black sm:text-4xl">Heute wird gerechnet!</h1><p class="mt-3 max-w-md text-orange-50">Kleine Schritte, grosse Aha-Momente. Such dir ein Thema aus und sammle XP.</p><button class="mt-6 rounded-2xl bg-white px-5 py-3 font-extrabold text-orange-600 shadow-sm hover:bg-orange-50" @click="emit('practice')">Jetzt üben <ChevronRight class="ml-1 inline" :size="18" /></button></div>
      <div class="rounded-[2rem] border border-violet-100 bg-violet-50 p-6"><div class="flex items-center justify-between"><span class="rounded-xl bg-white p-3 text-violet-600"><CalendarClock /></span><span class="font-extrabold text-violet-700">{{ daysUntil }} Tage</span></div><h2 class="mt-5 text-xl font-black text-violet-900">{{ exam.title }}</h2><p class="mt-1 text-sm text-violet-700">{{ exam.description }}</p><button class="mt-5 rounded-xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700" @click="emit('exam')">Probearbeit starten</button></div>
    </section>
    <section class="mt-6 rounded-[2rem] border border-orange-100 bg-orange-50 p-6 shadow-sm sm:p-7"><div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div class="flex items-center gap-2 text-orange-600"><CalendarCheck :size="22" /><p class="font-bold">Deine Tages-Challenge</p></div><h2 class="mt-2 text-2xl font-black text-stone-800">10 Aufgaben, ein Tagesziel</h2><p class="mt-1 text-sm text-stone-600">{{ daily.completion ? 'Heute hast du die Challenge bereits abgeschlossen.' : 'Alle Themen gemischt – nur ein Versuch pro Aufgabe.' }}</p></div><button class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600" @click="emit('daily')">{{ daily.completion ? 'Ergebnis ansehen' : 'Jetzt starten' }} <ChevronRight :size="18" /></button></div></section>
    <section class="mt-6 grid gap-3 sm:grid-cols-3"><div class="rounded-2xl bg-white p-4 shadow-sm"><Star class="text-amber-500" /><strong class="mt-2 block text-2xl">{{ progress.xp }} XP</strong><span class="text-sm text-stone-500">Level {{ progress.level }}</span><div class="mt-2 h-2 rounded-full bg-stone-100"><div class="h-2 rounded-full bg-amber-400" :style="{ width: `${progress.levelProgress}%` }" /></div></div><div class="rounded-2xl bg-white p-4 shadow-sm"><Flame class="text-rose-500" /><strong class="mt-2 block text-2xl">{{ progress.streak }} Tage</strong><span class="text-sm text-stone-500">Dein Lern-Streak</span></div><div class="rounded-2xl bg-white p-4 shadow-sm"><Target class="text-emerald-500" /><strong class="mt-2 block text-2xl">{{ progress.badges.length }}</strong><span class="text-sm text-stone-500">Abzeichen gesammelt</span></div></section>
    <section class="mt-8"><div class="mb-4 flex items-end justify-between"><div><p class="font-bold text-orange-500">Deine Lernreise</p><h2 class="text-2xl font-black text-stone-800">Themen entdecken</h2></div><span class="text-sm text-stone-500">Klasse 4/5</span></div><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <button v-for="topic in topics" :key="topic.key" class="group rounded-3xl border border-stone-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md" @click="emit('practice', topic.key)"><span class="text-3xl">{{ topic.emoji }}</span><h3 class="mt-3 font-black text-stone-800">{{ topic.title }}</h3><p class="mt-1 text-sm text-stone-500">{{ topic.description }}</p><div class="mt-4 flex items-center justify-between text-xs font-bold text-orange-600"><span>{{ progress.completed[topic.key] ?? 0 }} gelöst</span><ChevronRight class="transition group-hover:translate-x-1" :size="17" /></div></button>
    </div></section>
    <section v-if="progress.badges.length" class="mt-8 rounded-3xl border border-amber-100 bg-amber-50 p-5">
      <div class="flex items-center gap-2"><Trophy class="text-amber-600" :size="21" /><h2 class="font-black text-amber-900">Deine Abzeichen</h2></div>
      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="badge in progress.badges" :key="badge" class="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-amber-800 shadow-sm">{{ badge }}</span>
      </div>
    </section>
  </main>
</template>
