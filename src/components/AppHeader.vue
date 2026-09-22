<script setup lang="ts">
import { CalendarCheck, Flame, Home, Maximize2, Minimize2, PencilLine, Trophy } from 'lucide-vue-next'
import { useFullscreen } from '../composables/useFullscreen'

defineProps<{ active: 'home' | 'practice' | 'exam' | 'daily' }>()
const emit = defineEmits<{ navigate: [view: 'home' | 'practice' | 'exam' | 'daily'] }>()
const { errorMessage, isActive, isSupported, toggleFullscreen } = useFullscreen()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-orange-100 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-3 md:px-6">
      <button class="flex shrink-0 items-center gap-2 text-left" aria-label="Zur Startseite" @click="emit('navigate', 'home')">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl fox-gradient text-2xl shadow-sm sm:h-11 sm:w-11">🦊</span>
        <span><strong class="block text-base text-orange-600 sm:text-lg">MatheFox</strong><small class="hidden text-xs text-stone-500 sm:block">Schlau rechnen, Spass haben!</small></span>
      </button>
      <nav class="order-3 flex w-full items-center justify-between gap-1 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:justify-start sm:overflow-visible sm:pb-0" aria-label="Hauptnavigation">
        <button aria-label="Startseite" :class="active === 'home' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'home')"><Home :size="18" /><span>Start</span></button>
        <button aria-label="Üben" :class="active === 'practice' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'practice')"><PencilLine :size="18" /><span>Üben</span></button>
        <button aria-label="Tages-Challenge" :class="active === 'daily' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'daily')"><CalendarCheck :size="18" /><span>Heute</span></button>
        <button aria-label="Mathearbeit" :class="active === 'exam' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'exam')"><Trophy :size="18" /><span>Test</span></button>
      </nav>
      <div class="ml-auto flex items-center gap-1 sm:ml-0">
        <button
          type="button"
          :disabled="!isSupported"
          :aria-label="isActive ? 'Vollbild beenden' : 'Vollbild'"
          :title="isSupported ? (isActive ? 'Vollbild beenden' : 'Vollbild') : 'Vollbild wird von diesem Browser nicht unterstützt.'"
          class="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl px-2 text-sm font-bold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:text-stone-300 md:px-3"
          @click="toggleFullscreen"
        >
          <Minimize2 v-if="isActive" :size="18" />
          <Maximize2 v-else :size="18" />
          <span class="hidden md:inline">Vollbild</span>
        </button>
        <div class="hidden items-center gap-1 rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 sm:flex"><Flame :size="17" /> Streak</div>
      </div>
    </div>
    <p v-if="errorMessage" class="mx-auto max-w-6xl px-4 pb-2 text-center text-sm font-bold text-rose-600 md:px-6" role="alert">{{ errorMessage }}</p>
  </header>
</template>
