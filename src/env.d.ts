/// <reference types="vite/client" />
declare module 'canvas-confetti' {
  type ConfettiOptions = {
    particleCount?: number
    spread?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
  }
  const confetti: (options?: ConfettiOptions) => Promise<null> | null
  export default confetti
}
