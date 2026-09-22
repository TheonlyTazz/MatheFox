<script setup lang="ts">
import { Award, Download, Settings, Share2 } from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'
import { useCertificateStore } from '../stores/certificate'
import {
  createCertificatePreviewDataUrl,
  downloadCertificate,
  shareCertificate,
} from '../services/certificate'
import type { CertificateData } from '../types/certificate'

const props = defineProps<{ certificate: CertificateData }>()
const store = useCertificateStore()
const showSettings = ref(false)
const settingsButton = ref<HTMLButtonElement>()
const settingsDialog = ref<HTMLElement>()
const previousFocusedElement = ref<HTMLElement>()
const draftNickname = ref(store.nickname)
const actionError = ref('')
const previewError = ref('')
const busy = ref(false)

const previewUrl = computed(() => {
  try {
    previewError.value = ''
    return createCertificatePreviewDataUrl(props.certificate, store.nickname)
  } catch (error) {
    previewError.value = error instanceof Error ? error.message : 'Die Zertifikatsvorschau konnte nicht erstellt werden.'
    return ''
  }
})

const saveNickname = (): void => {
  try {
    store.setNickname(draftNickname.value)
    closeSettings()
    actionError.value = ''
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Der Spitzname konnte nicht gespeichert werden.'
  }
}

const download = async (): Promise<void> => {
  busy.value = true
  actionError.value = ''
  try {
    await downloadCertificate(props.certificate, store.nickname)
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Das Zertifikat konnte nicht heruntergeladen werden.'
  } finally {
    busy.value = false
  }
}

const share = async (): Promise<void> => {
  busy.value = true
  actionError.value = ''
  try {
    await shareCertificate(props.certificate, store.nickname)
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Das Zertifikat konnte nicht geteilt werden.'
  } finally {
    busy.value = false
  }
}

const closeSettings = (): void => {
  showSettings.value = false
  previousFocusedElement.value?.focus()
  previousFocusedElement.value = undefined
}

watch(showSettings, async (isOpen) => {
  if (isOpen) {
    previousFocusedElement.value = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    await nextTick()
    settingsDialog.value?.focus()
  }
})

const handleSettingsKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    closeSettings()
    return
  }
  if (event.key !== 'Tab' || !settingsDialog.value) return
  const focusable = Array.from(settingsDialog.value.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hasAttribute('disabled'))
  if (focusable.length === 0) {
    event.preventDefault()
    settingsDialog.value.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

</script>

<template>
  <article class="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p class="flex items-center gap-2 font-bold text-orange-600"><Award :size="20" /> Dein Zertifikat</p>
        <h2 class="mt-1 text-xl font-black text-stone-800">{{ certificate.awardTitle }}</h2>
      </div>
      <button ref="settingsButton" class="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-stone-600 hover:bg-stone-100" type="button" @click="draftNickname = store.nickname; showSettings = true"><Settings :size="17" /> Name</button>
    </div>
    <img v-if="previewUrl" :src="previewUrl" alt="Vorschau deines MatheFox-Zertifikats" class="w-full rounded-2xl border border-orange-100 bg-orange-50" />
    <p v-else class="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-bold text-rose-700" role="alert">{{ previewError }}</p>
    <p class="mt-3 text-sm text-stone-500">Spitzname: <strong class="text-stone-700">{{ store.nickname }}</strong></p>
    <p v-if="actionError" class="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700" role="alert">{{ actionError }}</p>
    <div class="mt-4 grid gap-2 min-[420px]:grid-cols-2">
      <button :disabled="busy" class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60" type="button" @click="download"><Download :size="18" /> Download PNG</button>
      <button :disabled="busy" class="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60" type="button" @click="share"><Share2 :size="18" /> Teilen</button>
    </div>
  </article>

  <div v-if="showSettings" class="fixed inset-0 z-40 grid place-items-center bg-stone-900/40 p-4" role="presentation" @click.self="closeSettings">
    <section ref="settingsDialog" aria-labelledby="certificate-name-title" aria-modal="true" class="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl" role="dialog" tabindex="-1" @keydown="handleSettingsKeydown">
      <h3 id="certificate-name-title" class="text-xl font-black text-stone-800">Dein Spitzname</h3>
      <p class="mt-2 text-sm text-stone-600">Der Name wird nur auf deinem Gerät gespeichert. Bitte keine privaten Daten eingeben.</p>
      <label class="mt-5 block text-sm font-bold text-stone-700" for="certificate-nickname">Spitzname</label>
      <input id="certificate-nickname" v-model="draftNickname" maxlength="20" class="mt-2 w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2" type="text" autocomplete="nickname" aria-describedby="certificate-name-help certificate-name-error" @keyup.enter="saveNickname" />
      <p id="certificate-name-help" class="mt-2 text-xs text-stone-500">Maximal 20 Zeichen. Standard: MatheFox.</p>
      <p v-if="actionError" id="certificate-name-error" class="mt-2 text-sm font-bold text-rose-700" role="alert">{{ actionError }}</p>
      <div class="mt-5 flex flex-col-reverse gap-2 min-[420px]:flex-row min-[420px]:justify-end">
        <button class="min-h-11 rounded-xl px-4 py-2 font-bold text-stone-600 hover:bg-stone-100" type="button" @click="closeSettings">Abbrechen</button>
        <button class="min-h-11 rounded-xl bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600" type="button" @click="saveNickname">Speichern</button>
      </div>
    </section>
  </div>
</template>
