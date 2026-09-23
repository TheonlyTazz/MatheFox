<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HeaderBar from './components/layout/HeaderBar.vue'
import IntroWizard from './components/wizard/IntroWizard.vue'
import Scratchpad from './components/Scratchpad.vue'
import DashboardView from './views/DashboardView.vue'
import PracticeView from './views/PracticeView.vue'
import ExamView from './views/ExamView.vue'
import { getGradeCatalog } from './data/grades'
import { useProfileStore } from './stores/profile'

type View = 'home' | 'practice' | 'exam'

const profile = useProfileStore()
const view = ref<View>('home')
const selectedTopic = ref<string>()
const scratchpadOpen = ref(false)
const practiceKey = computed(() => `${profile.currentGrade}:${profile.activeTopicIds.join(',')}:${selectedTopic.value === undefined ? 'mixed' : selectedTopic.value}`)

const goPractice = (topicId?: string): void => {
  if (profile.activeTopicIds.length === 0) throw new Error('Wähle zuerst mindestens ein Thema aus.')
  if (topicId && !profile.activeTopicIds.includes(topicId)) throw new Error(`Das Thema ${topicId} ist nicht aktiv.`)
  selectedTopic.value = topicId
  view.value = 'practice'
}

const navigate = (next: View): void => {
  if (next === 'practice') {
    goPractice()
    return
  }
  if (next === 'exam' && (profile.currentGrade !== 4 || getGradeCatalog(4).topics.some((topic) => !profile.activeTopicIds.includes(topic.id)))) {
    throw new Error('Die Mathearbeit ist nur mit allen Themen der Klasse 4 verfügbar.')
  }
  view.value = next
}

watch(() => [profile.currentGrade, ...profile.activeTopicIds], () => {
  if (view.value !== 'home') view.value = 'home'
  selectedTopic.value = undefined
})
</script>

<template>
  <div class="min-h-screen bg-orange-50/60">
    <IntroWizard v-if="!profile.hasCompletedWizard" />
    <template v-else>
      <HeaderBar :active="view" @navigate="navigate" @scratchpad="scratchpadOpen = true" />
      <DashboardView v-if="view === 'home'" @practice="goPractice" @exam="navigate('exam')" />
      <PracticeView v-else-if="view === 'practice'" :key="practiceKey" :initial-topic="selectedTopic" />
      <ExamView v-else @home="view = 'home'" />
      <footer class="mx-auto max-w-6xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 text-center text-xs text-stone-400 md:pt-6">MatheFox hilft dir beim Üben. Deine Fortschritte bleiben auf diesem Gerät.</footer>
    </template>
    <Scratchpad v-if="scratchpadOpen" @close="scratchpadOpen = false" />
  </div>
</template>
