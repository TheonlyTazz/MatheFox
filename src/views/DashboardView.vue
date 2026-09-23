<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, Flame, Star, Target, Trophy } from 'lucide-vue-next'
import CertificateModal from '../components/CertificateModal.vue'
import { getGradeCatalog } from '../data/grades'
import { useProfileStore } from '../stores/profile'
import type { CertificateData } from '../types/certificate'
import type { GradeLevel } from '../types/curriculum'

const emit = defineEmits<{ practice: [topicId?: string]; exam: [] }>()
const profile = useProfileStore()
const catalog = computed(() => getGradeCatalog(profile.currentGrade))
const activeTopics = computed(() => catalog.value.topics.filter((topic) => profile.activeTopicIds.includes(topic.id)))
const canTakeExam = computed(() => profile.currentGrade === 4 && profile.activeTopicIds.length === catalog.value.topics.length)
const certificate = ref<CertificateData>()
const certificateOpen = ref(false)
const badgeTitle = (badgeId: string): string => {
  if (!badgeId.startsWith('topic:')) throw new Error(`Unbekanntes Abzeichen: ${badgeId}`)
  const topicId = badgeId.slice(6)
  for (const grade of [1, 2, 3, 4] as const satisfies readonly GradeLevel[]) {
    const found = getGradeCatalog(grade).topics.find((topic) => topic.id === topicId)
    if (found) return found.title
  }
  throw new Error(`Unbekanntes Thema für Abzeichen: ${topicId}`)
}
const openBadge = (badgeId: string): void => {
  certificate.value = { awardTitle: 'MatheFox-Abzeichen', result: { label: 'Thema geschafft', value: badgeTitle(badgeId) }, issuedAt: new Date() }
  certificateOpen.value = true
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-6 md:py-12">
    <section class="fox-gradient rounded-[2rem] p-6 text-white shadow-lg sm:p-8 md:p-10">
      <p class="font-bold text-orange-100">Hallo, {{ profile.nickname }}! 👋</p>
      <h1 class="mt-2 text-3xl font-black sm:text-4xl">Dein Mathe-Abenteuer in Klasse {{ profile.currentGrade }}</h1>
      <p class="mt-3 max-w-2xl text-orange-50">Wähle ein Thema oder starte deine Tagesmission mit Aufgaben aus deinen ausgewählten Themen.</p>
      <button v-if="activeTopics.length" class="mt-6 min-h-12 rounded-2xl bg-white px-6 py-3 font-extrabold text-orange-600 shadow-sm hover:bg-orange-50" @click="emit('practice')">Tagesmission starten <ChevronRight class="ml-1 inline" :size="18" /></button>
      <p v-else class="mt-6 rounded-xl bg-white/20 p-4 font-bold">Du hast gerade keine Themen ausgewählt. Öffne „Themen anpassen“, um loszulegen.</p>
    </section>

    <section class="mt-6 grid gap-3 sm:grid-cols-3 md:gap-4" aria-label="Dein Fortschritt">
      <div class="rounded-2xl bg-white p-5 shadow-sm"><Star class="text-amber-500" /><strong class="mt-2 block text-2xl">{{ profile.xp }} XP</strong><span class="text-sm text-stone-500">Gesammelte Erfahrung</span></div>
      <div class="rounded-2xl bg-white p-5 shadow-sm"><Flame class="text-rose-500" /><strong class="mt-2 block text-2xl">{{ profile.dailyStreak }} Tage</strong><span class="text-sm text-stone-500">Dein Lern-Streak</span></div>
      <div class="rounded-2xl bg-white p-5 shadow-sm"><Target class="text-emerald-500" /><strong class="mt-2 block text-2xl">{{ activeTopics.length }}</strong><span class="text-sm text-stone-500">Aktive Themen</span></div>
    </section>

    <section class="mt-8 md:mt-10">
      <div class="mb-4 flex items-end justify-between gap-3"><div><p class="font-bold text-orange-500">Deine Lernreise</p><h2 class="text-2xl font-black text-stone-800">Themen entdecken</h2></div><span class="shrink-0 text-sm text-stone-500">{{ catalog.title }}</span></div>
      <div v-if="activeTopics.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button v-for="topic in activeTopics" :key="topic.id" class="group min-h-48 rounded-3xl border border-stone-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md" @click="emit('practice', topic.id)">
          <span class="text-4xl" aria-hidden="true">{{ topic.icon }}</span>
          <h3 class="mt-4 font-black text-stone-800">{{ topic.title }}</h3>
          <p class="mt-1 text-sm text-stone-500">{{ topic.description }}</p>
          <span class="mt-4 flex items-center gap-1 text-xs font-bold text-orange-600">Jetzt üben <ChevronRight :size="17" /></span>
        </button>
      </div>
      <p v-else class="rounded-2xl bg-white p-6 text-stone-600">Wähle oben über „Themen anpassen“ mindestens ein Thema aus.</p>
    </section>

    <section v-if="canTakeExam" class="mt-8 rounded-[2rem] border border-violet-100 bg-violet-50 p-6 md:mt-10 md:p-8">
      <Trophy class="text-violet-600" /><h2 class="mt-3 text-xl font-black text-violet-900">Mathearbeit vom 29.09.2026</h2>
      <p class="mt-1 text-sm text-violet-700">Probiere eine gemischte Mathearbeit für Klasse 4 aus.</p>
      <button class="mt-5 min-h-11 rounded-xl bg-violet-600 px-5 py-2 font-bold text-white hover:bg-violet-700" @click="emit('exam')">Probearbeit starten</button>
    </section>
    <section v-if="profile.unlockedBadgeIds.length" class="mt-8 rounded-3xl border border-amber-100 bg-amber-50 p-6 md:mt-10">
      <h2 class="flex items-center gap-2 font-black text-amber-900"><Trophy :size="21" /> Deine Abzeichen</h2>
      <div class="mt-4 flex flex-wrap gap-2"><button v-for="badgeId in profile.unlockedBadgeIds" :key="badgeId" class="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-800 shadow-sm hover:bg-amber-100" @click="openBadge(badgeId)">{{ badgeTitle(badgeId) }}</button></div>
    </section>
    <CertificateModal v-if="certificate" :open="certificateOpen" :certificate="certificate" @close="certificateOpen = false" />
  </main>
</template>
