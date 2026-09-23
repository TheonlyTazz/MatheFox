<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ filledIndices: readonly number[]; modelValue: readonly number[]; disabled?: boolean }>(), { disabled:false })
const emit = defineEmits<{ 'update:modelValue': [value:number[]]; speak: [text:string] }>()
const valid = (indices: readonly number[]): boolean => indices.every((index) => Number.isInteger(index) && index >= 0 && index < 64)
if (!valid(props.filledIndices) || !valid(props.modelValue)) throw new Error('Mirror grid indices must be integers from 0 to 63')
if (props.filledIndices.some((index) => index % 8 > 3)) throw new Error('Mirror source cells must be left of the mirror axis')
const cells = computed(() => new Set(props.modelValue))
const toggle = (index:number): void => { if (props.disabled || index % 8 < 4) return; const next = new Set(props.modelValue); next.has(index) ? next.delete(index) : next.add(index); emit('update:modelValue', [...next].sort((a,b) => a-b)); emit('speak', `Reihe ${Math.floor(index / 8) + 1}, Spalte ${index % 8 + 1}`) }
</script>
<template>
  <div class="mirror-wrap" aria-label="Spiegelwerkstatt"><div class="mirror-grid"><button v-for="index in 64" :key="index" type="button" class="mirror-cell" :class="{ source: filledIndices.includes(index - 1), filled: cells.has(index - 1), axis: (index - 1) % 8 === 3 }" :disabled="disabled || (index - 1) % 8 < 4" :aria-label="`Reihe ${Math.ceil(index / 8)}, Spalte ${((index - 1) % 8) + 1}`" @click="toggle(index - 1)" /></div><p class="mirror-caption">Spiegelachse zwischen Spalte 4 und 5</p></div>
</template>
<style scoped>.mirror-wrap { width:100%; max-width:33rem; margin:auto; overflow-x:auto; }.mirror-grid { display:grid; grid-template-columns:repeat(8,56px); width:max-content; gap:3px; padding:4px; background:#57534e; border-radius:.7rem; }.mirror-cell { width:56px; height:56px; border:0; border-radius:3px; background:#fafaf9; cursor:pointer; }.mirror-cell.source,.mirror-cell.filled { background:#f97316; }.mirror-cell:not(:disabled):hover { background:#fdba74; }.mirror-cell.axis { border-right:4px solid #2563eb; }.mirror-caption { margin:.5rem 0; text-align:center; color:#2563eb; font-weight:800; }</style>
