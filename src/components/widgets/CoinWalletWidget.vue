<script setup lang="ts">
import { computed, ref } from 'vue'
import { playBeep } from '../../services/audio'

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ change: [totalCents: number] }>()
const denominations = [1, 2, 5, 10, 20, 50, 100, 200] as const
type Denomination = typeof denominations[number]
type Coin = { id: number; value: Denomination }
const coins = ref<Coin[]>([])
let nextId = 1
const totalCents = computed(() => coins.value.reduce((sum, coin) => sum + coin.value, 0))
const dragged = ref<Denomination | null>(null)
const conveyor = ref<HTMLElement | null>(null)
const dragMoved = ref(false)
const suppressClick = ref(false)
const dragPointerId = ref<number | null>(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const display = (value: number): string => value >= 100 ? `${(value / 100).toFixed(value % 100 === 0 ? 0 : 2).replace('.', ',')} €` : `${value} ct`
const add = (value: Denomination): void => { if (props.disabled) return; coins.value.push({ id: nextId++, value }); playBeep(560 + value * 2); emit('change', totalCents.value) }
const remove = (id: number): void => { if (props.disabled) return; coins.value = coins.value.filter((coin) => coin.id !== id); playBeep(300); emit('change', totalCents.value) }
const beginDrag = (value: Denomination, event: PointerEvent): void => {
  if (props.disabled) return
  dragged.value = value
  dragMoved.value = false
  dragPointerId.value = event.pointerId
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
const moveDrag = (event: PointerEvent): void => {
  if (dragged.value === null || dragPointerId.value !== event.pointerId) return
  const distance = Math.hypot(event.clientX - dragStartX.value, event.clientY - dragStartY.value)
  if (distance > 8) dragMoved.value = true
}
const finishDrag = (event: PointerEvent): void => {
  if (dragged.value === null || dragPointerId.value !== event.pointerId) return
  const value = dragged.value
  const bounds = conveyor.value?.getBoundingClientRect()
  const droppedOnConveyor = dragMoved.value && bounds !== undefined && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom
  suppressClick.value = dragMoved.value
  if (suppressClick.value) setTimeout(() => { suppressClick.value = false }, 0)
  dragged.value = null
  dragPointerId.value = null
  dragStartX.value = 0
  dragStartY.value = 0
  if (droppedOnConveyor) add(value)
}
const cancelDrag = (event: PointerEvent): void => {
  if (dragPointerId.value !== event.pointerId) return
  dragged.value = null
  dragPointerId.value = null
  dragStartX.value = 0
  dragStartY.value = 0
  dragMoved.value = false
  suppressClick.value = true
  setTimeout(() => { suppressClick.value = false }, 0)
}
const activateCoin = (value: Denomination): void => {
  if (suppressClick.value) { suppressClick.value = false; return }
  add(value)
}
</script>

<template>
  <section class="manipulative coin-wallet" :aria-disabled="disabled">
    <div class="wallet-head"><strong>Geldbeutel</strong><span>Tippen oder ziehen</span></div>
    <div class="wallet" role="list" aria-label="Münzen">
      <button v-for="value in denominations" :key="value" class="coin" type="button" :disabled="disabled" :aria-label="`${display(value)} hinzufügen`" @click="activateCoin(value)" @pointerdown="beginDrag(value, $event)" @pointermove="moveDrag" @pointerup="finishDrag" @pointercancel="cancelDrag">
        <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" /><text x="40" y="47" text-anchor="middle">{{ value >= 100 ? `${value / 100}€` : value }}</text></svg>
      </button>
    </div>
    <div ref="conveyor" class="conveyor" aria-label="Kassenband, Münze hier ablegen">
      <span class="conveyor-title">Kassenband</span>
      <button v-for="coin in coins" :key="coin.id" class="belt-coin" type="button" :disabled="disabled" :aria-label="`${display(coin.value)} entfernen`" @click.stop="remove(coin.id)">{{ coin.value >= 100 ? `${coin.value / 100}€` : `${coin.value}c` }}</button>
    </div>
    <output class="sum">Summe: <strong>{{ display(totalCents) }}</strong></output>
  </section>
</template>

<style scoped>
.manipulative { width: min(100%, 680px); padding: 1rem; border-radius: 1.25rem; background: #fff; box-shadow: 0 5px 18px #9a341233; color: #431407; }.wallet-head { display:flex; justify-content:space-between; gap:1rem; margin-bottom:.6rem; }.wallet { display:flex; flex-wrap:wrap; gap:.4rem; }.coin { width:64px; height:64px; padding:0; border:0; background:transparent; touch-action:none; }.coin svg { width:100%; height:100%; }.coin circle { fill:#fde68a; stroke:#d97706; stroke-width:4; }.coin text { fill:#92400e; font-size:15px; font-weight:700; }.conveyor { min-height:100px; display:flex; align-items:center; flex-wrap:wrap; gap:.45rem; margin-top:1rem; padding:.8rem; border:3px dashed #94a3b8; border-radius:.8rem; background:repeating-linear-gradient(135deg,#e2e8f0 0 12px,#cbd5e1 12px 24px); touch-action:none; }.conveyor-title { width:100%; font-weight:700; }.belt-coin { min-width:56px; min-height:56px; border:3px solid #b45309; border-radius:50%; background:#fcd34d; color:#78350f; font-weight:700; }.sum { display:block; margin-top:.8rem; font-size:1.25rem; }
</style>
