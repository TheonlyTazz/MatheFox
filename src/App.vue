<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import DashboardView from './views/DashboardView.vue'
import PracticeView from './views/PracticeView.vue'
import ExamView from './views/ExamView.vue'
import type { TopicKey } from './types/math'

const view = ref<'home' | 'practice' | 'exam'>('home')
const selectedTopic = ref<TopicKey | undefined>()
const goPractice = (topic?: TopicKey): void => { selectedTopic.value = topic; view.value = 'practice' }
</script>

<template>
  <div class="min-h-screen bg-orange-50/60">
    <AppHeader :active="view" @navigate="view = $event" />
    <DashboardView v-if="view === 'home'" @practice="goPractice" @exam="view = 'exam'" />
    <PracticeView v-else-if="view === 'practice'" :initial-topic="selectedTopic" />
    <ExamView v-else @home="view = 'home'" />
    <footer class="mx-auto max-w-6xl px-4 pb-8 pt-4 text-center text-xs text-stone-400">MatheFox hilft dir beim Üben. Deine Fortschritte bleiben auf diesem Gerät.</footer>
  </div>
</template>
