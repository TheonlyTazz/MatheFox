<script setup lang="ts">
import { computed } from 'vue'
import { playBeep } from '../../services/audio'

const props = withDefaults(defineProps<{ left: number; right: number; modelValue: '<' | '>' | '=' | null; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ 'update:modelValue': [value: '<' | '>' | '=']; speak: [text: string] }>()
if (!Number.isInteger(props.left) || !Number.isInteger(props.right) || props.left < 0 || props.left > 20 || props.right < 0 || props.right > 20) throw new Error('Comparison quantities must be integers from 0 to 20')
if (props.modelValue !== null && !['<', '>', '='].includes(props.modelValue)) throw new Error('Comparison selection must be <, >, =, or null')
const correct = computed(() => props.left < props.right ? '<' : props.left > props.right ? '>' : '=')
const choose = (value: '<' | '>' | '='): void => { if (props.disabled) return; emit('update:modelValue', value); emit('speak', value === '=' ? 'Gleich viel' : value === '<' ? 'Kleiner als' : 'Größer als'); if (value === correct.value) playBeep(880, .14) }
</script>

<template>
  <div class="comparison-widget" aria-label="Mengen vergleichen">
    <div class="quantities"><div class="quantity"><span v-for="index in left" :key="`l-${index}`" class="token" aria-hidden="true">●</span><strong>{{ left }}</strong></div><span class="question">?</span><div class="quantity"><span v-for="index in right" :key="`r-${index}`" class="token blue" aria-hidden="true">●</span><strong>{{ right }}</strong></div></div>
    <div class="comparison-options"><div v-for="option in (['<', '>', '='] as const)" :key="option" class="comparison-choice"><button type="button" :disabled="disabled" class="comparison-card" :class="{ chosen:modelValue === option, chomp:modelValue === option && option === correct }" @click="choose(option)"><svg viewBox="0 0 90 60" aria-hidden="true"><path v-if="option !== '='" d="M12 17c18-13 41-7 59 4l-14 9 14 9c-18 11-41 17-59 4 7-8 7-18 0-26Z" :transform="option === '>' ? 'translate(90 0) scale(-1 1)' : undefined" fill="#84cc16" stroke="#3f6212" stroke-width="4"/><path v-if="option === '='" d="M18 22h54M18 38h54" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/><text v-if="option !== '='" x="45" y="40" text-anchor="middle" font-size="25" font-weight="bold" fill="#365314">{{ option }}</text></svg><strong>{{ option === '=' ? 'Gleich viel' : option === '<' ? 'Kleiner als' : 'Größer als' }}</strong></button><button type="button" class="comparison-speak" :aria-label="`${option === '=' ? 'Gleich viel' : option === '<' ? 'Kleiner als' : 'Größer als'} vorlesen`" @click="emit('speak', option === '=' ? 'Gleich viel' : option === '<' ? 'Kleiner als' : 'Größer als')">🔊</button></div></div>
  </div>
</template>

<style scoped>
.comparison-widget { display:grid; gap:1rem; }.quantities { display:flex; align-items:center; justify-content:center; gap:1.2rem; }.quantity { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; max-width:14rem; gap:.25rem; border:3px solid #fed7aa; border-radius:1rem; background:#fff7ed; padding:.65rem; }.token { color:#ef4444; font-size:1.45rem; line-height:1; }.token.blue { color:#3b82f6; }.quantity strong { flex-basis:100%; text-align:center; font-size:1.3rem; }.question { font-size:2rem; font-weight:900; }.comparison-options { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.7rem; }.comparison-choice { display:flex; flex-direction:column; align-items:center; gap:.35rem; }.comparison-card { min-height:7rem; width:100%; border:3px solid #bae6fd; border-radius:1rem; background:#f0f9ff; padding:.45rem; font-size:.85rem; font-weight:800; cursor:pointer; }.comparison-speak { min-width:56px; min-height:56px; border-radius:.8rem; background:#ede9fe; font-size:1.2rem; }.comparison-card:hover:not(:disabled),.comparison-card:focus-visible { transform:translateY(-4px); }.comparison-card.chosen { border-color:#2563eb; box-shadow:0 0 0 4px #bfdbfe; }.comparison-card.chomp { animation:chomp .35s ease; border-color:#16a34a; }.comparison-card svg { width:100%; height:3.5rem; } @keyframes chomp { 35% { transform:scale(1.09) rotate(-3deg); } }
</style>
