<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  options: readonly string[]
  modelValue: string | null
  disabled?: boolean
}>(), { disabled: false })
const emit = defineEmits<{
  'update:modelValue': [value: string]
  speak: [text: string]
}>()

if (props.options.length === 0) throw new Error('Shape options must contain at least one shape')
const knownShapes = ['Kreis', 'Dreieck', 'Quadrat', 'Rechteck', 'Würfel', 'Kugel', 'Quader'] as const
if (props.options.some((shape) => !knownShapes.some((known) => known === shape))) throw new Error('Shape options contain an unknown shape')
if (props.modelValue !== null && !props.options.includes(props.modelValue)) throw new Error('Selected shape must be one of the provided options')

const selected = computed(() => props.modelValue)
const select = (shape: string): void => {
  if (!props.disabled) {
    emit('update:modelValue', shape)
    emit('speak', shape)
  }
}
</script>

<template>
  <div class="shape-select-grid" role="list" aria-label="Formen auswählen">
    <div v-for="shape in options" :key="shape" class="shape-wrap"><button type="button" class="shape-card" :class="{ selected: selected === shape }" :disabled="disabled" :aria-pressed="selected === shape" @click="select(shape)">
      <svg viewBox="0 0 120 100" class="shape-svg" aria-hidden="true">
        <circle v-if="shape === 'Kreis'" cx="60" cy="50" r="32" fill="#fbbf24" stroke="#b45309" stroke-width="5" />
        <polygon v-else-if="shape === 'Dreieck'" points="60,14 98,82 22,82" fill="#fb7185" stroke="#be123c" stroke-width="5" />
        <rect v-else-if="shape === 'Quadrat'" x="27" y="18" width="66" height="66" rx="3" fill="#60a5fa" stroke="#1d4ed8" stroke-width="5" />
        <rect v-else-if="shape === 'Rechteck'" x="15" y="28" width="90" height="44" rx="3" fill="#a78bfa" stroke="#6d28d9" stroke-width="5" />
        <g v-else-if="shape === 'Würfel'" stroke="#0f766e" stroke-width="4" stroke-linejoin="round"><path d="M60 13 94 32v38L60 89 26 70V32Z" fill="#5eead4" /><path d="m26 32 34 20 34-20M60 52v37" fill="none" /></g>
        <circle v-else-if="shape === 'Kugel'" cx="60" cy="50" r="34" fill="#34d399" stroke="#047857" stroke-width="5" /><g v-else-if="shape === 'Quader'" stroke="#c2410c" stroke-width="4" stroke-linejoin="round"><path d="M20 31 75 17l29 18-55 16Z" fill="#fdba74" /><path d="M49 51v36l55-17V35M20 31v36l29 20" fill="#fb923c" /></g>
        <g v-if="shape !== 'Kreis'" class="vertices"><circle v-if="shape === 'Dreieck'" cx="60" cy="14" r="4" /><circle v-if="shape === 'Dreieck'" cx="22" cy="82" r="4" /><circle v-if="shape === 'Dreieck'" cx="98" cy="82" r="4" /><circle v-if="shape === 'Quadrat'" cx="27" cy="18" r="4" /><circle v-if="shape === 'Quadrat'" cx="93" cy="18" r="4" /><circle v-if="shape === 'Quadrat'" cx="27" cy="82" r="4" /><circle v-if="shape === 'Quadrat'" cx="93" cy="82" r="4" /><circle v-if="shape === 'Rechteck'" cx="15" cy="28" r="4" /><circle v-if="shape === 'Rechteck'" cx="105" cy="28" r="4" /><circle v-if="shape === 'Rechteck'" cx="15" cy="72" r="4" /><circle v-if="shape === 'Rechteck'" cx="105" cy="72" r="4" /></g>
      </svg>
      <span class="shape-name">{{ shape }}</span><span v-if="selected === shape" class="shape-check" aria-hidden="true">✓</span>
    </button><button type="button" class="shape-speaker" :aria-label="`${shape} vorlesen`" @click="emit('speak', shape)">🔊</button></div>
  </div>
</template>

<style scoped>
.shape-select-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(9rem,1fr)); gap:.75rem; }
.shape-wrap { position:relative; }
.shape-card { position:relative; min-height:10rem; width:100%; min-width:9rem; border:3px solid #fed7aa; border-radius:1rem; background:#fff7ed; padding:.65rem 3.8rem .65rem .65rem; color:#431407; cursor:pointer; transition:transform .18s,box-shadow .18s,border-color .18s; }
.shape-card:hover:not(:disabled),.shape-card:focus-visible { transform:translateY(-5px); box-shadow:0 7px 0 #fdba74; }
.shape-card.selected { border-color:#16a34a; box-shadow:0 0 0 4px #bbf7d0; animation:lift .3s ease; }
.shape-svg { display:block; width:100%; height:6rem; }.shape-name { font-weight:800; }.shape-speaker { position:absolute; right:.4rem; bottom:.4rem; width:56px; height:56px; border-radius:.8rem; background:#ede9fe; font-size:1.2rem; }.shape-check { position:absolute; top:.35rem; right:.5rem; color:#15803d; font-size:1.6rem; font-weight:900; }.vertices circle { fill:#fff; stroke:#dc2626; stroke-width:2; animation:pulse 1.2s infinite; }
@keyframes pulse { 50% { r:6; opacity:.55; } } @keyframes lift { 50% { transform:translateY(-7px) scale(1.03); } }
</style>
