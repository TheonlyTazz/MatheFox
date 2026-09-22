<script setup lang="ts">
import { Flame, Home, PencilLine, Trophy } from 'lucide-vue-next'

defineProps<{ active: 'home' | 'practice' | 'exam' }>()
const emit = defineEmits<{ navigate: [view: 'home' | 'practice' | 'exam'] }>()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-orange-100 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
      <button class="flex items-center gap-2 text-left" aria-label="Zur Startseite" @click="emit('navigate', 'home')">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl fox-gradient text-2xl shadow-sm sm:h-11 sm:w-11">🦊</span>
        <span><strong class="block text-base text-orange-600 sm:text-lg">MatheFox</strong><small class="hidden text-xs text-stone-500 sm:block">Schlau rechnen, Spass haben!</small></span>
      </button>
      <nav class="flex items-center gap-1" aria-label="Hauptnavigation">
        <button aria-label="Startseite" :class="active === 'home' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'home')"><Home :size="18" /><span>Start</span></button>
        <button aria-label="Üben" :class="active === 'practice' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'practice')"><PencilLine :size="18" /><span>Üben</span></button>
        <button aria-label="Mathearbeit" :class="active === 'exam' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:flex-row sm:gap-1 sm:px-3 sm:text-sm" @click="emit('navigate', 'exam')"><Trophy :size="18" /><span>Test</span></button>
      </nav>
      <div class="hidden items-center gap-1 rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 sm:flex"><Flame :size="17" /> Streak</div>
    </div>
  </header>
</template>
