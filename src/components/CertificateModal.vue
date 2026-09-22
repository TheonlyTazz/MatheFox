<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CertificateCard from './CertificateCard.vue'
import type { CertificateData } from '../types/certificate'

const props = defineProps<{ open: boolean; certificate: CertificateData }>()
const emit = defineEmits<{ close: [] }>()
const closeButton = ref<HTMLButtonElement>()
const dialog = ref<HTMLElement>()
const previousOverflow = ref('')
const previousFocusedElement = ref<HTMLElement>()

const close = (): void => emit('close')

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    previousOverflow.value = document.body.style.overflow
    previousFocusedElement.value = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.body.style.overflow = previousOverflow.value
    previousFocusedElement.value?.focus()
    previousFocusedElement.value = undefined
  }
}, { immediate: true })

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow.value
})

const handleDialogKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = Array.from(dialog.value.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hasAttribute('disabled'))
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.value.focus()
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
  <div v-if="open" class="fixed inset-0 z-30 overflow-y-auto bg-stone-900/40 p-4" role="presentation" @click.self="close">
    <div class="mx-auto flex min-h-full max-w-2xl items-center justify-center py-6">
      <div ref="dialog" aria-labelledby="certificate-modal-title" aria-modal="true" class="relative w-full" role="dialog" tabindex="-1" @keydown="handleDialogKeydown">
        <h2 id="certificate-modal-title" class="sr-only">MatheFox-Zertifikat</h2>
        <button ref="closeButton" aria-label="Zertifikat schliessen" class="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-sm hover:bg-white" type="button" @click="close"><X :size="20" /></button>
        <CertificateCard :certificate="certificate" />
      </div>
    </div>
  </div>
</template>
