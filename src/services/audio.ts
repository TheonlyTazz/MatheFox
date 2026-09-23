let context: AudioContext | undefined
let soundEffectsEnabled = false

export const setSoundEffectsEnabled = (enabled: boolean): void => {
  if (typeof enabled !== 'boolean') throw new Error('Sound effects preference must be a boolean')
  soundEffectsEnabled = enabled
  if (!enabled && context?.state === 'running') void context.suspend()
}

export const playBeep = (frequency = 640, duration = 0.08): void => {
  if (!soundEffectsEnabled) return
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime
  const length = Math.max(duration, 0.04)
  oscillator.type = 'sine'
  oscillator.frequency.value = Math.min(Math.max(frequency, 180), 520)
  oscillator.connect(gain)
  gain.connect(context.destination)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(0.025, now + Math.min(0.015, length / 3))
  gain.gain.exponentialRampToValueAtTime(0.001, now + length)
  oscillator.start()
  oscillator.stop(now + length)
}
