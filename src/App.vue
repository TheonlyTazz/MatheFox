<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import DashboardView from './views/DashboardView.vue'
import PracticeView from './views/PracticeView.vue'
import ExamView from './views/ExamView.vue'
import DailyChallengeView from './views/DailyChallengeView.vue'
import type { TopicKey } from './types/math'

const view = ref<'home' | 'practice' | 'exam' | 'daily'>('home')
const selectedTopic = ref<TopicKey | undefined>()
const goPractice = (topic?: TopicKey): void => { selectedTopic.value = topic; view.value = 'practice' }
</script>

<template>
  <div class="min-h-screen bg-orange-50/60">
    <AppHeader :active="view" @navigate="view = $event" />
    <DashboardView v-if="view === 'home'" @practice="goPractice" @exam="view = 'exam'" @daily="view = 'daily'" />
    <PracticeView v-else-if="view === 'practice'" :initial-topic="selectedTopic" />
    <ExamView v-else-if="view === 'exam'" @home="view = 'home'" />
    <DailyChallengeView v-else @home="view = 'home'" />
    <footer class="mx-auto max-w-6xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 text-center text-xs text-stone-400 md:pt-6">MatheFox hilft dir beim Üben. Deine Fortschritte bleiben auf diesem Gerät.</footer>
  </div>
</template>
