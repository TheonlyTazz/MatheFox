<script setup lang="ts">
import { computed, ref } from 'vue'
const props = withDefaults(defineProps<{ start:number; target:number; modelValue:number; disabled?:boolean }>(), { disabled:false })
const emit = defineEmits<{ 'update:modelValue': [value:number] }>()
if (![props.start, props.target, props.modelValue].every((value) => Number.isInteger(value) && value >= 0 && value <= 100)) throw new Error('Number line values must be integers from 0 to 100')
const previous = ref(props.modelValue)
const value = computed(() => Math.max(0, Math.min(100, props.modelValue)))
const hop = (amount:number): void => { if (props.disabled) return; previous.value = value.value; emit('update:modelValue', Math.max(0, Math.min(100, value.value + amount))) }
</script>
<template>
  <div class="frog-widget"><svg viewBox="0 0 720 170" class="number-line" role="img" :aria-label="`Zahl ${value}`"><path v-if="previous !== value" class="hop-arc" :d="`M ${previous * 7 + 10} 94 Q ${(previous + value) * 3.5 + 10} 15 ${value * 7 + 10} 94`" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="8 6"/><line x1="10" y1="95" x2="710" y2="95" stroke="#57534e" stroke-width="4"/><g v-for="tick in 11" :key="tick"><line :x1="(tick - 1) * 70 + 10" y1="87" :x2="(tick - 1) * 70 + 10" y2="104" stroke="#57534e" stroke-width="3"/><text :x="(tick - 1) * 70 + 10" y="125" text-anchor="middle" font-size="14">{{ (tick - 1) * 10 }}</text></g><text :x="value * 7 + 10" y="76" text-anchor="middle" font-size="27">🐸</text></svg><div class="frog-controls"><button type="button" :disabled="disabled" @click="hop(10)">+10</button><button type="button" :disabled="disabled" @click="hop(1)">+1</button><button type="button" :disabled="disabled" @click="hop(-1)">−1</button></div><p>{{ value }} <span aria-hidden="true">→</span> Ziel: {{ target }}</p></div>
</template>
<style scoped>.frog-widget { display:grid; gap:.6rem; text-align:center; }.number-line { width:100%; height:auto; overflow:visible; }.hop-arc { animation:hop .45s ease-out; }.frog-controls { display:flex; justify-content:center; gap:.75rem; }.frog-controls button { min-width:5rem; min-height:3.5rem; border:3px solid #fb923c; border-radius:1rem; background:#fff7ed; color:#7c2d12; font-size:1.15rem; font-weight:900; cursor:pointer; }.frog-controls button:hover:not(:disabled) { transform:translateY(-3px); }@keyframes hop { from { stroke-dashoffset:30; opacity:.3; } to { stroke-dashoffset:0; opacity:1; } }</style>
