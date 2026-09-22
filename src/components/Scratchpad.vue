<script setup lang="ts">
import { Eraser, Pencil, X } from 'lucide-vue-next'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ close: [] }>()
const canvas = ref<HTMLCanvasElement>()
const closeButton = ref<HTMLButtonElement>()
let drawing = false
const resizeCanvas = (): void => {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  canvas.value.width = Math.round(rect.width * ratio)
  canvas.value.height = Math.round(rect.height * ratio)
  const context = canvas.value.getContext('2d')
  if (!context) throw new Error('Scratchpad drawing context is unavailable.')
  context.scale(ratio, ratio)
  context.lineWidth = 3
  context.lineCap = 'round'
  context.strokeStyle = '#7c3aed'
}
const start = (event: PointerEvent): void => {
  if (!canvas.value) throw new Error('Scratchpad canvas is unavailable.')
  const context = canvas.value.getContext('2d')
  if (!context) throw new Error('Scratchpad drawing context is unavailable.')
  const rect = canvas.value.getBoundingClientRect()
  context.beginPath()
  context.moveTo(event.clientX - rect.left, event.clientY - rect.top)
  drawing = true
  canvas.value.setPointerCapture(event.pointerId)
}
const draw = (event: PointerEvent): void => {
  if (!drawing || !canvas.value) return
  const context = canvas.value.getContext('2d')
  if (!context) throw new Error('Scratchpad drawing context is unavailable.')
  const rect = canvas.value.getBoundingClientRect()
  context.lineTo(event.clientX - rect.left, event.clientY - rect.top)
  context.stroke()
}
const clear = (): void => canvas.value?.getContext('2d')?.clearRect(0, 0, canvas.value.width, canvas.value.height)
const stopDrawing = (): void => { drawing = false }
const handleKeydown = (event: KeyboardEvent): void => { if (event.key === 'Escape') emit('close') }
onMounted(() => {
  nextTick(resizeCanvas)
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
  closeButton.value?.focus()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="fixed inset-0 z-30 grid place-items-center bg-stone-900/40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" role="dialog" aria-modal="true" aria-label="Schmierblatt">
    <div class="w-full max-w-2xl rounded-3xl bg-white p-4 shadow-2xl">
      <div class="mb-3 flex items-center justify-between"><h2 class="flex items-center gap-2 text-xl font-extrabold text-violet-700"><Pencil :size="22" /> Schmierblatt</h2><button ref="closeButton" class="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-stone-100" aria-label="Schliessen" @click="emit('close')"><X /></button></div>
      <canvas ref="canvas" class="paper-grid h-[55vh] max-h-[520px] min-h-[260px] w-full touch-none rounded-2xl border-2 border-violet-200" @pointerdown="start" @pointermove="draw" @pointerup="stopDrawing" @pointercancel="stopDrawing" @pointerleave="stopDrawing" />
      <button class="mt-3 flex min-h-11 items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-200" @click="clear"><Eraser :size="17" /> Alles löschen</button>
    </div>
  </div>
</template>
