<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExerciseVisual } from '../types/curriculum'
import TenTwentyFrameWidget from './widgets/TenTwentyFrameWidget.vue'
import CoinWalletWidget from './widgets/CoinWalletWidget.vue'
import MultiplicationArrayWidget from './widgets/MultiplicationArrayWidget.vue'
import FrogNumberLineWidget from './widgets/FrogNumberLineWidget.vue'

const props = withDefaults(defineProps<{ visual: ExerciseVisual; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ answer: [value: number] }>()
const selectedSector = ref<number | null>(null)
const spinCount = ref(0)
const frogValue = ref(props.visual.kind === 'frog-number-line' ? props.visual.start : 0)

const validate = (visual: ExerciseVisual): void => {
  if (visual.kind === 'tokens' && visual.tokens.length === 0) throw new Error('Token visual must contain at least one token')
  if (visual.kind === 'pairs' && (!Number.isInteger(visual.groups) || visual.groups < 1)) throw new Error('Pair visual must contain positive groups')
  if (visual.kind === 'wheel' && visual.sectors.length < 2) throw new Error('Wheel visual must contain at least two sectors')
  if (visual.kind === 'bars' && (visual.bars.length === 0 || visual.bars.some((bar) => !Number.isFinite(bar.value) || bar.value < 0))) throw new Error('Bar visual must contain non-negative finite values')
  if (visual.kind === 'grid-shape' && (!Number.isInteger(visual.columns) || visual.columns < 1 || visual.cells.length === 0 || visual.cells.length % visual.columns !== 0)) throw new Error('Grid visual must have positive columns and a complete grid')
  if (visual.kind === 'combinations' && (visual.groups.length < 2 || visual.groups.some((group) => group.options.length === 0))) throw new Error('Combination visual must contain at least two non-empty groups')
  if (visual.kind === 'combinations' && visual.layout === 'tree' && visual.groups.length !== 2) throw new Error('Tree diagram must have exactly two levels')
  if (visual.kind === 'ten-frame' && ((visual.capacity !== 10 && visual.capacity !== 20) || !Number.isInteger(visual.redCount) || visual.redCount < 0 || visual.redCount > visual.capacity)) throw new Error('Ten frame visual has invalid capacity or red count')
  if (visual.kind === 'multiplication-array' && (![visual.rows, visual.columns].every((value) => Number.isInteger(value) && value >= 1 && value <= 10))) throw new Error('Multiplication array dimensions must be between 1 and 10')
  if (visual.kind === 'frog-number-line' && (![visual.start, visual.target].every((value) => Number.isInteger(value) && value >= 0 && value <= 100))) throw new Error('Frog number line values must be between 0 and 100')
}
validate(props.visual)

const wheelStyle = computed(() => {
  const visual = props.visual
  if (visual.kind !== 'wheel') return {}
  const angle = 360 / visual.sectors.length
  const sectors = visual.sectors.map((sector, index) => `${sector.color} ${index * angle}deg ${(index + 1) * angle}deg`).join(', ')
  const selected = selectedSector.value
  return {
    background: `conic-gradient(${sectors})`,
    transform: selected === null ? 'rotate(0deg)' : `rotate(${spinCount.value * 360 - (selected + 0.5) * angle}deg)`,
  }
})
const spinWheel = (): void => {
  if (props.disabled || props.visual.kind !== 'wheel') return
  selectedSector.value = Math.floor(Math.random() * props.visual.sectors.length)
  spinCount.value += 1
}
const updateFrog = (value: number): void => {
  frogValue.value = value
  emit('answer', value)
}
</script>

<template>
  <section class="exercise-visual rounded-2xl bg-orange-50 p-4" aria-label="Aufgabenbild">
    <div v-if="visual.kind === 'tokens'" class="flex flex-wrap justify-center gap-2"><span v-for="(token, index) in visual.tokens" :key="`${token}-${index}`" class="text-3xl">{{ token }}</span></div>
    <div v-else-if="visual.kind === 'pairs'" class="flex flex-wrap justify-center gap-4"><div v-for="group in visual.groups" :key="group" class="flex items-center gap-1 rounded-xl bg-white p-2"><span v-for="pair in (visual.mirrored ? 2 : 1)" :key="pair" class="text-2xl">{{ visual.icon }}</span></div></div>
    <div v-else-if="visual.kind === 'wheel'" class="flex flex-col items-center gap-3"><div class="wheel-wrap"><span class="wheel-pointer" aria-hidden="true" /><button type="button" :disabled="disabled" class="wheel" :style="wheelStyle" aria-label="Glücksrad drehen" @click="spinWheel" /></div><div class="flex flex-wrap justify-center gap-2"><span v-for="(sector, index) in visual.sectors" :key="`${sector.label}-${index}`" class="rounded-full px-3 py-1 text-xs font-bold" :style="{ backgroundColor: sector.color }">{{ sector.label }}</span></div><span class="text-sm font-bold text-stone-600">{{ selectedSector === null ? 'Drehen' : visual.sectors[selectedSector]?.label }}</span></div>
    <div v-else-if="visual.kind === 'bars' && visual.orientation !== 'horizontal'" class="mx-auto flex max-w-md items-end justify-center gap-3 border-b-2 border-l-2 border-stone-400 px-3 pb-1 pt-4" style="min-height: 10rem"><div v-for="bar in visual.bars" :key="bar.label" class="flex min-w-10 flex-1 flex-col items-center justify-end gap-1"><span class="text-xs font-bold">{{ bar.value }}</span><div class="w-full rounded-t-lg" :style="{ height: `${Math.max(4, bar.value * 2)}px`, backgroundColor: bar.color }" /><span class="text-center text-xs font-bold">{{ bar.label }}</span></div></div>
    <div v-else-if="visual.kind === 'bars'" class="mx-auto flex max-w-md flex-col gap-2 border-b-2 border-l-2 border-stone-400 px-3 pb-2 pt-3"><div v-for="bar in visual.bars" :key="bar.label" class="flex items-center gap-2"><span class="w-20 text-right text-xs font-bold">{{ bar.label }}</span><div class="h-7 rounded-r-lg" :style="{ width: `${Math.max(4, bar.value * 2)}px`, backgroundColor: bar.color }" /><span class="text-xs font-bold">{{ bar.value }}</span></div></div>
    <div v-else-if="visual.kind === 'grid-shape'" class="mx-auto grid max-w-xs gap-1" :style="{ gridTemplateColumns: `repeat(${visual.columns}, minmax(0, 1fr))` }"><span v-for="(filled, index) in visual.cells" :key="index" class="aspect-square rounded border" :class="filled ? 'border-violet-500 bg-violet-400' : 'border-stone-200 bg-white'" /></div>
    <div v-else-if="visual.kind === 'combinations' && visual.layout === 'tree'" class="flex flex-col items-center gap-2"><strong class="rounded-lg bg-orange-200 px-3 py-1">Start</strong><div class="flex w-full justify-around gap-2 border-t-2 border-orange-300 pt-2"><div v-for="option in visual.groups[0].options" :key="option" class="flex flex-col items-center gap-1"><strong class="rounded-lg bg-white px-2 py-1 text-sm">{{ option }}</strong><span v-for="branch in visual.groups[1].options" :key="branch" class="rounded-lg border-l-2 border-orange-300 bg-orange-100 px-2 py-1 text-xs">↳ {{ branch }}</span></div></div></div>
    <div v-else-if="visual.kind === 'combinations'" class="flex flex-wrap items-center justify-center gap-2"><template v-for="(group, groupIndex) in visual.groups" :key="group.label"><div class="rounded-xl bg-white p-2 text-center"><strong class="block text-xs text-stone-600">{{ group.label }}</strong><span v-for="option in group.options" :key="option" class="mx-1 inline-block rounded bg-orange-100 px-2 py-1 text-sm font-bold">{{ option }}</span></div><span v-if="groupIndex < visual.groups.length - 1" class="text-xl font-bold text-orange-600">×</span></template></div>
    <TenTwentyFrameWidget v-else-if="visual.kind === 'ten-frame'" :capacity="visual.capacity" :red-count="visual.redCount" :disabled="disabled" @change="emit('answer', $event)" />
    <CoinWalletWidget v-else-if="visual.kind === 'coin-wallet'" :disabled="disabled" @change="emit('answer', $event)" />
    <MultiplicationArrayWidget v-else-if="visual.kind === 'multiplication-array'" :initial-rows="visual.rows" :initial-columns="visual.columns" :disabled="disabled" @change="emit('answer', $event)" />
    <FrogNumberLineWidget v-else-if="visual.kind === 'frog-number-line'" :model-value="frogValue" :start="visual.start" :target="visual.target" :disabled="disabled" @update:model-value="updateFrog" />
  </section>
</template>

<style scoped>
.wheel-wrap { position: relative; padding-top: 0.8rem; }
.wheel { width: 11rem; height: 11rem; border: 0.35rem solid #c2410c; border-radius: 50%; transition: transform 800ms cubic-bezier(.17,.67,.25,1.2); }
.wheel-pointer { position: absolute; z-index: 1; top: 0; left: 50%; width: 0; height: 0; transform: translateX(-50%); border-right: 0.65rem solid transparent; border-left: 0.65rem solid transparent; border-top: 1.2rem solid #7c2d12; }
</style>
