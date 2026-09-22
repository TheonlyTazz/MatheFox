let context: AudioContext | undefined

export const playBeep = (frequency = 640, duration = 0.08): void => {
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = frequency
  oscillator.connect(gain)
  gain.connect(context.destination)
  gain.gain.setValueAtTime(0.08, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
}
