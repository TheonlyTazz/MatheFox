<script setup lang="ts">
import { computed, ref } from 'vue'

type Capacity = 10 | 20
type Token = 'empty' | 'red' | 'blue'

const props = withDefaults(defineProps<{ capacity: Capacity; redCount: number; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ change: [total: number] }>()

if (props.capacity !== 10 && props.capacity !== 20) throw new Error('TenTwentyFrameWidget capacity must be 10 or 20')
if (!Number.isInteger(props.redCount) || props.redCount < 0 || props.redCount > props.capacity) throw new Error('TenTwentyFrameWidget redCount must be within capacity')

const tokens = ref<Token[]>(Array.from({ length: props.capacity }, (_, index) => index < props.redCount ? 'red' : 'empty'))
const grabbed = ref<number | null>(null)
const moved = ref(false)
const total = computed(() => tokens.value.filter((token) => token !== 'empty').length)
const redTotal = computed(() => tokens.value.filter((token) => token === 'red').length)
const blueTotal = computed(() => tokens.value.filter((token) => token === 'blue').length)
const rows = computed(() => props.capacity === 10 ? 2 : 2)

const announce = (): void => emit('change', total.value)
const cycle = (index: number): void => {
  if (props.disabled) return
  if (moved.value) { moved.value = false; return }
  const next: Token = tokens.value[index] === 'empty' ? 'blue' : tokens.value[index] === 'blue' ? 'red' : 'empty'
  tokens.value[index] = next
  announce()
}
const setToken = (index: number, token: Token): void => {
  if (props.disabled || index < 0 || index >= tokens.value.length) return
  tokens.value[index] = token
  announce()
}
const onPointerDown = (index: number, event: PointerEvent): void => {
  if (props.disabled) return
  grabbed.value = index
  moved.value = false
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
const onPointerMove = (event: PointerEvent): void => {
  if (grabbed.value === null || props.disabled) return
  if (props.capacity === 20 && event.pointerType === 'touch') return
  moved.value = true
  const element = event.currentTarget as HTMLElement
  const bounds = element.getBoundingClientRect()
  const columns = props.capacity === 10 ? 5 : 10
  const column = Math.floor(((event.clientX - bounds.left + element.scrollLeft) / element.scrollWidth) * columns)
  const row = Math.floor(((event.clientY - bounds.top) / bounds.height) * rows.value)
  if (column >= 0 && column < columns && row >= 0 && row < rows.value) {
    const index = row * columns + column
    if (index < props.capacity) setToken(index, tokens.value[grabbed.value])
  }
}
const onPointerUp = (): void => { grabbed.value = null }
const tokenLabel = (token: Token): string => token === 'red' ? 'Roter Stein' : token === 'blue' ? 'Blauer Stein' : 'Leerer Platz'
</script>

<template>
  <section class="manipulative ten-frame" :aria-disabled="disabled">
    <div class="frame-toolbar"><strong>{{ capacity === 10 ? 'Zehnerfeld' : 'Zwanzigerfeld' }}</strong><span>{{ redTotal }} Rot + {{ blueTotal }} Blau = {{ total }}</span></div><p class="frame-help">Tippe freie Felder an, um blaue Steine dazuzulegen.</p>
    <div class="frame-grid" :class="`capacity-${capacity}`" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
      <button v-for="(token, index) in tokens" :key="index" class="token-cell" :class="token" type="button" :aria-label="`${index + 1}: ${tokenLabel(token)}`" :disabled="disabled" @click="cycle(index)" @pointerdown="onPointerDown(index, $event)">
        <span v-if="token !== 'empty'" class="token" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.manipulative { width: min(100%, 620px); padding: 1rem; border-radius: 1.25rem; background: #fff; box-shadow: 0 5px 18px #9a341233; color: #431407; }
.frame-toolbar { display: flex; justify-content: space-between; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem; font-size: 1.05rem; }
.frame-help { margin: 0 0 .65rem; font-size: .9rem; color: #7c2d12; }
.frame-grid { display: grid; grid-template-columns: repeat(5, minmax(56px, 1fr)); grid-template-rows: repeat(2, minmax(56px, 1fr)); gap: .4rem; padding: .5rem; border: 4px solid #fdba74; border-radius: .9rem; touch-action: none; }
.capacity-20 { grid-template-columns: repeat(10, 56px); overflow-x: auto; touch-action: pan-x; }
.capacity-20 .token-cell { touch-action: pan-x; }
.token-cell { min-width: 56px; min-height: 56px; display: grid; place-items: center; border: 2px solid #fed7aa; border-radius: .55rem; background: #fff7ed; padding: .2rem; touch-action: none; }
.token-cell:disabled { cursor: default; opacity: .7; }
.token-cell.red { background: #fff1f2; border-color: #fda4af; }.token-cell.blue { background: #eff6ff; border-color: #93c5fd; }
.token { width: 70%; aspect-ratio: 1; border-radius: 50%; background: #ef4444; box-shadow: inset -4px -5px #b91c1c; }.blue .token { background: #3b82f6; box-shadow: inset -4px -5px #1d4ed8; }
@media (max-width: 520px) { .capacity-20 { gap: .15rem; padding: .25rem; } }
</style>
