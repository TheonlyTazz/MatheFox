<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ArrowLeft, CheckCircle2, ChevronRight, LockKeyhole, Trophy } from 'lucide-vue-next'
import CertificateModal from '../components/CertificateModal.vue'
import ExerciseCard from '../components/ExerciseCard.vue'
import { useDailyChallengeStore } from '../stores/dailyChallenge'
import type { CertificateData } from '../types/certificate'

const emit = defineEmits<{ home: [] }>()
const daily = useDailyChallengeStore()
daily.syncToToday()
const answered = (questionId: string): boolean => daily.results[questionId] !== undefined
const firstUnanswered = daily.challenge.questions.findIndex((question) => !answered(question.id))
const active = ref(firstUnanswered >= 0 ? firstUnanswered : 0)
const current = computed(() => daily.challenge.questions[active.value])
const currentResult = computed(() => current.value ? daily.results[current.value.id] : undefined)
const score = computed(() => daily.challenge.questions.filter((question) => daily.results[question.id]?.correct).length)
const certificate = ref<CertificateData>()
const certificateOpen = ref(false)
const captureCertificate = (): void => {
  if (!daily.completion || certificate.value) return
  certificate.value = {
    awardTitle: 'Tages-Challenge',
    result: { label: 'Ergebnis', value: `${score.value} von ${daily.challenge.questions.length} richtig` },
    issuedAt: new Date(),
  }
}
captureCertificate()
let rolloverTimer: ReturnType<typeof setInterval> | undefined
const syncDate = (): void => {
  const previousDate = daily.currentDateKey
  daily.syncToToday()
  if (daily.currentDateKey !== previousDate) {
    active.value = 0
    certificate.value = undefined
    certificateOpen.value = false
    captureCertificate()
  }
}
const solved = (correct: boolean, _credit: boolean, answer: string): void => {
  if (!current.value) throw new Error('Die Tages-Challenge hat keine aktuelle Aufgabe.')
  daily.submit(current.value.id, answer)
  captureCertificate()
  if (!correct) return
  if (active.value < daily.challenge.questions.length - 1) active.value += 1
}
const openCertificate = (): void => {
  if (!certificate.value) throw new Error('Für die Tages-Challenge ist noch kein Zertifikat verfügbar.')
  certificateOpen.value = true
}
const closeCertificate = (): void => {
  certificateOpen.value = false
}
onMounted(() => {
  rolloverTimer = setInterval(syncDate, 30_000)
})
onUnmounted(() => {
  if (rolloverTimer) clearInterval(rolloverTimer)
})
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-6 sm:py-10">
    <div v-if="!daily.completion && current" class="rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button class="mb-3 flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 font-bold text-stone-500 hover:bg-stone-100" @click="emit('home')"><ArrowLeft :size="18" /> Zur Startseite</button>
          <p class="font-bold text-orange-600">Tages-Challenge · {{ active + 1 }}/{{ daily.challenge.questions.length }}</p>
          <h1 class="mt-1 text-2xl font-black leading-tight text-stone-800">{{ daily.challenge.title }}</h1>
          <p class="mt-2 text-sm text-stone-500">{{ daily.challenge.description }}</p>
        </div>
        <div class="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 font-black text-orange-700"><LockKeyhole :size="18" /> Ein Versuch</div>
      </div>
      <ExerciseCard :key="current.id" :exercise="current" :initial-answer="currentResult?.input" :initial-submitted="Boolean(currentResult)" single-attempt @solved="solved" />
      <div class="mt-5 flex justify-between gap-2">
        <button :disabled="active === 0" class="min-h-11 rounded-xl px-4 py-2 font-bold text-stone-500 hover:bg-stone-100 disabled:opacity-40" @click="active = Math.max(0, active - 1)">Zurück</button>
        <button v-if="answered(current.id) && active < daily.challenge.questions.length - 1" class="flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 font-bold text-white hover:bg-orange-600" @click="active++">Nächste <ChevronRight :size="18" /></button>
      </div>
    </div>
    <div v-else class="rounded-[2rem] bg-white p-8 text-center shadow-sm">
      <Trophy class="mx-auto text-amber-500" :size="58" />
      <h1 class="mt-4 text-3xl font-black text-stone-800">Tages-Challenge geschafft!</h1>
      <p class="mt-2 text-stone-500">Du hast {{ score }} von {{ daily.challenge.questions.length }} Aufgaben richtig gelöst.</p>
      <div class="mx-auto mt-6 max-w-xs rounded-2xl bg-amber-50 p-5"><strong class="text-4xl text-amber-600">{{ Math.round((score / daily.challenge.questions.length) * 100) }}%</strong><p class="mt-1 text-sm text-amber-800">Dein Tages-Ergebnis</p></div>
      <p class="mt-5 flex items-center justify-center gap-2 font-bold text-emerald-700"><CheckCircle2 :size="20" /> Für heute erledigt</p>
      <button type="button" class="mt-6 flex mx-auto min-h-11 items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-white hover:bg-amber-600" @click="openCertificate">Zertifikat ansehen</button>
      <button class="mt-3 flex mx-auto items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white" @click="emit('home')">Zur Startseite</button>
    </div>
    <CertificateModal v-if="certificate" :open="certificateOpen" :certificate="certificate" @close="closeCertificate" />
  </main>
</template>
