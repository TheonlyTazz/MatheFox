<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { playBeep } from '../../services/audio'

type ClockValue = { hour: number; minute: number }
type Grade = 1 | 2 | 3 | 4
type DragTarget = 'hour' | 'minute'

const props = defineProps({
  modelValue: { type: Object as PropType<ClockValue>, required: true },
  target: { type: Object as PropType<ClockValue>, required: true },
  grade: { type: Number as PropType<Grade>, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits<{
  'update:modelValue': [value: ClockValue]
  speak: [text: string]
}>()

const root = ref<HTMLElement | null>(null)
const dragging = ref<DragTarget | null>(null)
const validClock = (value: ClockValue): boolean => Number.isInteger(value.hour) && value.hour >= 1 && value.hour <= 12 && Number.isInteger(value.minute) && value.minute >= 0 && value.minute <= 59
const validate = (): void => {
  if (!validClock(props.modelValue) || !validClock(props.target)) throw new Error('DraggableClockWidget received an invalid clock value')
  if (![1, 2, 3, 4].includes(props.grade)) throw new Error('DraggableClockWidget received an invalid grade')
}
validate()
watch(() => [props.modelValue, props.target, props.grade], validate, { deep: true })

const center = 180
const radius = 132
const marks = Array.from({ length: 12 }, (_, index) => {
  const angle = (index + 1) * 30 * Math.PI / 180
  return { value: index + 1, x: center + Math.sin(angle) * 108, y: center - Math.cos(angle) * 108 }
})
const ticks = Array.from({ length: 60 }, (_, index) => {
  const angle = index * 6 * Math.PI / 180
  const outer = radius
  const inner = index % 5 === 0 ? radius - 12 : radius - 7
  return { x1: center + Math.sin(angle) * inner, y1: center - Math.cos(angle) * inner, x2: center + Math.sin(angle) * outer, y2: center - Math.cos(angle) * outer, major: index % 5 === 0 }
})
const hourAngle = computed(() => ((props.modelValue.hour % 12) * 30 + props.modelValue.minute * 0.5) * Math.PI / 180)
const minuteAngle = computed(() => props.modelValue.minute * 6 * Math.PI / 180)
const hands = computed(() => ({
  hour: { x: center + Math.sin(hourAngle.value) * 75, y: center - Math.cos(hourAngle.value) * 75 },
  hourGrip: { x: center + Math.sin(hourAngle.value) * 50, y: center - Math.cos(hourAngle.value) * 50 },
  minute: { x: center + Math.sin(minuteAngle.value) * 108, y: center - Math.cos(minuteAngle.value) * 108 },
}))
const targetText = computed(() => `Ziel: ${props.target.hour}:${String(props.target.minute).padStart(2, '0')} Uhr`)
const valueText = computed(() => `Eingestellt: ${props.modelValue.hour}:${String(props.modelValue.minute).padStart(2, '0')} Uhr`)
const snapMinute = (angle: number): number => {
  const increment = props.grade === 1 ? 60 : props.grade === 2 ? 5 : 1
  return (Math.round(angle / (increment * 6)) * increment) % 60
}
const normalizeHour = (hour: number): number => ((hour - 1 + 12) % 12) + 1
const update = (value: ClockValue): void => {
  validate()
  if (value.hour === props.modelValue.hour && value.minute === props.modelValue.minute) return
  emit('update:modelValue', value)
  playBeep(640, 0.045)
}
const angleAt = (event: PointerEvent): number => {
  const element = root.value
  if (element === null) throw new Error('Clock root is unavailable while dragging')
  const bounds = element.getBoundingClientRect()
  const scale = 360 / Math.min(bounds.width, bounds.height)
  const x = (event.clientX - bounds.left - bounds.width / 2) * scale
  const y = (event.clientY - bounds.top - bounds.height / 2) * scale
  return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360
}
const move = (event: PointerEvent): void => {
  if (dragging.value === null || props.disabled) return
  const angle = angleAt(event)
  if (dragging.value === 'minute') {
    const minute = snapMinute(angle)
    if (props.grade === 1) return
    const previousMinute = props.modelValue.minute
    const crossedHour = previousMinute >= 55 && minute <= 5 ? 1 : previousMinute <= 5 && minute >= 55 ? -1 : 0
    update({ hour: normalizeHour(props.modelValue.hour + crossedHour), minute })
  } else {
    const hour = normalizeHour(Math.round((angle - props.modelValue.minute * 0.5) / 30))
    update({ hour, minute: props.grade === 1 ? 0 : props.modelValue.minute })
  }
}
const endDrag = (event: PointerEvent): void => {
  if (root.value?.hasPointerCapture(event.pointerId)) root.value.releasePointerCapture(event.pointerId)
  dragging.value = null
}
const beginDrag = (target: DragTarget, event: PointerEvent): void => {
  if (props.disabled || (target === 'minute' && props.grade === 1)) return
  dragging.value = target
  root.value?.setPointerCapture(event.pointerId)
  move(event)
}
const keyboardAdjust = (target: DragTarget, event: KeyboardEvent): void => {
  if (props.disabled || (target === 'minute' && props.grade === 1)) return
  const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0
  if (direction === 0) return
  event.preventDefault()
  if (target === 'hour') update({ hour: normalizeHour(props.modelValue.hour + direction), minute: props.grade === 1 ? 0 : props.modelValue.minute })
  else {
    const increment = props.grade === 2 ? 5 : 1
    const total = props.modelValue.hour * 60 + props.modelValue.minute + direction * increment
    update({ hour: normalizeHour(Math.floor(total / 60)), minute: ((total % 60) + 60) % 60 })
  }
}
const speakTarget = (): void => emit('speak', targetText.value)
onBeforeUnmount(() => { dragging.value = null })
</script>

<template>
  <section class="clock-widget" :class="{ 'is-disabled': disabled }" aria-label="Interaktive Uhr">
    <div class="clock-widget__header">
      <span class="clock-widget__pill">{{ targetText }}</span>
      <button type="button" class="clock-widget__speak" aria-label="Ziel vorlesen" :disabled="disabled" @click="speakTarget">🔊</button>
    </div>
    <div ref="root" class="clock-widget__face" :class="{ 'is-dragging': dragging !== null }" @pointermove="move" @pointerup="endDrag" @pointercancel="endDrag">
      <svg viewBox="0 0 360 360" role="img" aria-label="Zifferblatt mit beweglichen Zeigern">
        <circle cx="180" cy="180" r="148" fill="white" stroke="#d8e2ee" stroke-width="4" />
        <line v-for="tick in ticks" :key="`${tick.x1}-${tick.y1}`" :x1="tick.x1" :y1="tick.y1" :x2="tick.x2" :y2="tick.y2" :stroke="tick.major ? '#61758b' : '#aebdca'" :stroke-width="tick.major ? 3 : 1.5" />
        <text v-for="mark in marks" :key="mark.value" :x="mark.x" :y="mark.y" text-anchor="middle" dominant-baseline="middle" class="clock-widget__number">{{ mark.value }}</text>
        <text v-for="minute in [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]" :key="minute" :x="center + Math.sin(minute * 6 * Math.PI / 180) * 126" :y="center - Math.cos(minute * 6 * Math.PI / 180) * 126" text-anchor="middle" dominant-baseline="middle" class="clock-widget__minute">{{ minute }}</text>
        <line x1="180" y1="180" :x2="hands.hour.x" :y2="hands.hour.y" stroke="#e34b4b" stroke-width="12" stroke-linecap="round" />
        <line x1="180" y1="180" :x2="hands.minute.x" :y2="hands.minute.y" stroke="#287dcc" stroke-width="6" stroke-linecap="round" />
        <circle cx="180" cy="180" r="9" fill="#334155" />
        <circle :cx="hands.hourGrip.x" :cy="hands.hourGrip.y" r="19" fill="#e34b4b" pointer-events="none" />
        <circle :cx="hands.minute.x" :cy="hands.minute.y" r="19" fill="#287dcc" pointer-events="none" />
        <circle class="clock-widget__handle clock-widget__handle--hour" tabindex="0" role="slider" aria-label="Stundenzeiger" :aria-valuenow="modelValue.hour" aria-valuemin="1" aria-valuemax="12" :cx="hands.hourGrip.x" :cy="hands.hourGrip.y" r="42" fill="transparent" pointer-events="all" @pointerdown.stop="beginDrag('hour', $event)" @keydown="keyboardAdjust('hour', $event)" />
        <circle class="clock-widget__handle clock-widget__handle--minute" :tabindex="grade === 1 ? -1 : 0" role="slider" aria-label="Minutenzeiger" :aria-disabled="grade === 1" :aria-valuenow="modelValue.minute" aria-valuemin="0" aria-valuemax="59" :cx="hands.minute.x" :cy="hands.minute.y" r="42" fill="transparent" pointer-events="all" @pointerdown.stop="beginDrag('minute', $event)" @keydown="keyboardAdjust('minute', $event)" />
      </svg>
    </div>
    <p class="clock-widget__reading" aria-live="polite">{{ valueText }}</p>
  </section>
</template>

<style scoped>
.clock-widget { width: min(100%, 420px); margin: 0 auto; color: #26384a; overflow-x: auto; }
.clock-widget__header { display: flex; align-items: center; justify-content: center; gap: .5rem; margin-bottom: .5rem; }
.clock-widget__pill { border-radius: 999px; background: #eef5fb; padding: .6rem 1rem; font-weight: 700; }
.clock-widget__speak { min-width: 56px; min-height: 56px; border: 0; border-radius: 50%; background: #fff; cursor: pointer; font-size: 1.3rem; }
.clock-widget__face { width: 100%; min-width: 240px; aspect-ratio: 1; touch-action: none; user-select: none; }
.clock-widget__face svg { display: block; width: 100%; height: 100%; overflow: visible; }
.clock-widget__number { fill: #34495e; font-size: 17px; font-weight: 700; }
.clock-widget__minute { fill: #6e8294; font-size: 7px; }
.clock-widget__handle { cursor: grab; stroke: white; stroke-width: 4; outline: none; }
.clock-widget__handle:focus { stroke: #f5b942; stroke-width: 6; }
.clock-widget__handle:active, .is-dragging .clock-widget__handle { cursor: grabbing; }
.clock-widget__reading { margin: .5rem 0 0; text-align: center; font-size: 1.1rem; font-weight: 700; }
.is-disabled { opacity: .6; }
</style>
