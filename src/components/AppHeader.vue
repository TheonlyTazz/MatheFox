<script setup lang="ts">
import { Flame, Home, PencilLine, Trophy } from 'lucide-vue-next'

defineProps<{ active: 'home' | 'practice' | 'exam' }>()
const emit = defineEmits<{ navigate: [view: 'home' | 'practice' | 'exam'] }>()
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-orange-100 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
      <button class="flex items-center gap-2 text-left" aria-label="Zur Startseite" @click="emit('navigate', 'home')">
        <span class="grid h-11 w-11 place-items-center rounded-2xl fox-gradient text-2xl shadow-sm">🦊</span>
        <span><strong class="block text-lg text-orange-600">MatheFox</strong><small class="text-xs text-stone-500">Schlau rechnen, Spass haben!</small></span>
      </button>
      <nav class="flex items-center gap-1" aria-label="Hauptnavigation">
        <button aria-label="Startseite" :class="active === 'home' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="rounded-xl p-2 sm:px-3" @click="emit('navigate', 'home')"><Home :size="19" /><span class="hidden sm:inline">Start</span></button>
        <button aria-label="Üben" :class="active === 'practice' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="rounded-xl p-2 sm:px-3" @click="emit('navigate', 'practice')"><PencilLine :size="19" /><span class="hidden sm:inline">Üben</span></button>
        <button aria-label="Mathearbeit" :class="active === 'exam' ? 'bg-orange-100 text-orange-700' : 'text-stone-500'" class="rounded-xl p-2 sm:px-3" @click="emit('navigate', 'exam')"><Trophy :size="19" /><span class="hidden sm:inline">Mathearbeit</span></button>
      </nav>
      <div class="hidden items-center gap-1 rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 sm:flex"><Flame :size="17" /> Streak</div>
    </div>
  </header>
</template>
