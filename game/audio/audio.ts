export type GameSound = 'move' | 'blocked' | 'commit' | 'plate' | 'win' | 'fail'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

const SOUND_NOTES: Record<GameSound, number[]> = {
  move: [330],
  blocked: [120],
  commit: [392, 523],
  plate: [440, 660],
  win: [523, 659, 784],
  fail: [220, 165, 110],
}

export function playSound(sound: GameSound, muted: boolean): void {
  if (muted) return

  const context = getAudioContext()
  if (!context) return

  const notes = SOUND_NOTES[sound]
  const now = context.currentTime

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = now + index * 0.075
    const duration = sound === 'win' || sound === 'fail' ? 0.16 : 0.08

    oscillator.type = sound === 'fail' || sound === 'blocked' ? 'square' : 'triangle'
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  })
}
