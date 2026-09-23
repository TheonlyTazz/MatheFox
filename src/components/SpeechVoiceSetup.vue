<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSpeech } from '../composables/useSpeech'

const { checkInstalled, prepareVoice, isInstalled, isChecking, isLoading, downloadLoaded, downloadTotal, error } = useSpeech()
const percentage = computed(() => downloadTotal.value > 0 ? Math.min(100, Math.round(downloadLoaded.value / downloadTotal.value * 100)) : null)

onMounted(() => {
  void checkInstalled().catch((failure: unknown) => {
    error.value = failure instanceof Error ? failure.message : String(failure)
  })
})

const download = async (): Promise<void> => {
  try {
    await prepareVoice()
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
  }
}
</script>

<template>
  <section class="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950" aria-label="Offline-Stimme Ramona">
    <p class="font-bold">🔊 Kostenlose Stimme Ramona</p>
    <p class="mt-1">Einmalig etwa 95 MB laden. Danach wird die Sprache auf diesem Gerät erzeugt, ohne Konto oder laufende Kosten.</p>
    <p v-if="isChecking" class="mt-2" role="status">Prüfe, ob die Stimme schon geladen ist …</p>
    <p v-else-if="isInstalled" class="mt-2 font-bold text-emerald-700" role="status">Stimme ist bereit.</p>
    <div v-else class="mt-3">
      <button type="button" class="min-h-14 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-60" :disabled="isLoading" @click="download">{{ isLoading ? 'Stimme wird geladen …' : 'Ramona herunterladen' }}</button>
      <p v-if="isLoading" class="mt-2" role="status">{{ percentage === null ? 'Download und Vorbereitung laufen …' : `Download: ${percentage} %` }}</p>
      <progress v-if="isLoading && percentage !== null" class="mt-2 w-full accent-violet-700" :value="percentage" max="100" :aria-label="`Download ${percentage} Prozent`" />
    </div>
    <p v-if="error" class="mt-2 text-rose-700" role="alert">{{ error }}</p>
  </section>
</template>
