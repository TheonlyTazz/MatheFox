<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ initialRows: number; initialColumns: number; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ change: [product: number] }>()
if (!Number.isInteger(props.initialRows) || props.initialRows < 1 || props.initialRows > 10) throw new Error('MultiplicationArrayWidget initialRows must be between 1 and 10')
if (!Number.isInteger(props.initialColumns) || props.initialColumns < 1 || props.initialColumns > 10) throw new Error('MultiplicationArrayWidget initialColumns must be between 1 and 10')
const rowCount = ref(props.initialRows)
const columnCount = ref(props.initialColumns)
const product = computed(() => rowCount.value * columnCount.value)
const announce = (): void => emit('change', product.value)
const adjust = (axis: 'rows' | 'columns', amount: number): void => {
  if (props.disabled) return
  const target = axis === 'rows' ? rowCount : columnCount
  target.value = Math.max(1, Math.min(10, target.value + amount))
  announce()
}
</script>

<template>
  <section class="manipulative array-widget" :aria-disabled="disabled">
    <div class="array-controls">
      <div><span>Reihen: <strong>{{ rowCount }}</strong></span><button type="button" :disabled="disabled || rowCount <= 1" aria-label="Reihe entfernen" @click="adjust('rows', -1)">−</button><button type="button" :disabled="disabled || rowCount >= 10" aria-label="Reihe hinzufügen" @click="adjust('rows', 1)">+</button></div>
      <div><span>Spalten: <strong>{{ columnCount }}</strong></span><button type="button" :disabled="disabled || columnCount <= 1" aria-label="Spalte entfernen" @click="adjust('columns', -1)">−</button><button type="button" :disabled="disabled || columnCount >= 10" aria-label="Spalte hinzufügen" @click="adjust('columns', 1)">+</button></div>
    </div>
    <div class="equation" aria-live="polite">{{ rowCount }} × {{ columnCount }} = <strong>{{ product }}</strong><span aria-hidden="true"> · {{ columnCount }} × {{ rowCount }} = {{ product }}</span></div>
    <div class="dot-array" :style="{ '--columns': columnCount }" role="img" :aria-label="`${rowCount} Reihen mit je ${columnCount} Punkten, insgesamt ${product}`">
      <span v-for="dot in product" :key="dot" class="dot" />
    </div>
  </section>
</template>

<style scoped>
.manipulative { width:min(100%,680px); padding:1rem; border-radius:1.25rem; background:#fff; box-shadow:0 5px 18px #9a341233; color:#431407; }.array-controls { display:flex; flex-wrap:wrap; gap:.7rem; justify-content:space-between; }.array-controls > div { display:flex; align-items:center; gap:.35rem; flex-wrap:wrap; }.array-controls button { min-width:56px; min-height:56px; border:2px solid #fdba74; border-radius:.7rem; background:#fff7ed; font-size:1.5rem; color:#9a3412; }.equation { margin:1rem 0; font-size:1.25rem; }.equation span { color:#64748b; font-size:1rem; }.dot-array { display:grid; grid-template-columns:repeat(var(--columns), minmax(22px, 1fr)); gap:.45rem; max-width:600px; padding:.8rem; border:3px solid #bfdbfe; border-radius:.8rem; background:#eff6ff; }.dot { width:100%; aspect-ratio:1; max-width:38px; justify-self:center; border-radius:50%; background:#2563eb; box-shadow:inset -3px -4px #1e40af; }
@media (max-width:600px) { .dot-array { gap:.25rem; padding:.5rem; }.equation span { display:block; margin-top:.3rem; } }
</style>
