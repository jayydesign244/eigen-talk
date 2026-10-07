import { useEffect, useState } from 'react'

/** Live input level from the microphone, as 24 bars (0–1). */
export function useMicLevels(stream, active, bars = 24) {
  const [levels, setLevels] = useState(() => Array(bars).fill(0))
  useEffect(() => {
    if (!stream || !active) return undefined
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return undefined
    const ctx = new Ctx()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    source.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf
    const tick = () => {
      analyser.getByteFrequencyData(data)
      setLevels(Array.from({ length: bars }, (_, i) => (data[i + 2] || 0) / 255))
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      source.disconnect()
      ctx.close()
    }
  }, [stream, active, bars])
  return levels
}
