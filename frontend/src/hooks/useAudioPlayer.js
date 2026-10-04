import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

/**
 * WaveSurfer-backed player. Colours are passed in (resolved from the theme
 * by the caller) and the waveform is rebuilt when they change, so it always
 * matches light/dark mode.
 */
export function useAudioPlayer({
  url,
  height = 64,
  waveColor = '#3d3d3d',
  progressColor = '#ffffff',
  cursorColor = '#2ce6e0',
} = {}) {
  const containerRef = useRef(null)
  const wsRef = useRef(null)
  const stateRef = useRef({ time: 0, playing: false, volume: 1, rate: 1 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url || !containerRef.current) return undefined

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 0,
      height,
      normalize: true,
      dragToSeek: true,
      url,
    })
    wsRef.current = ws

    setIsReady(false)
    setError(null)

    const onReady = () => {
      setDuration(ws.getDuration())
      setIsReady(true)
      // Keep position/volume/rate when the waveform is rebuilt (e.g. theme change).
      const s = stateRef.current
      ws.setVolume(s.volume)
      ws.setPlaybackRate(s.rate, true)
      if (s.time && s.time < ws.getDuration()) ws.setTime(s.time)
    }
    const onPlay = () => { setIsPlaying(true); stateRef.current.playing = true }
    const onPause = () => { setIsPlaying(false); stateRef.current.playing = false }
    const onFinish = () => { setIsPlaying(false); stateRef.current.playing = false }
    const onTimeUpdate = (t) => { setCurrentTime(t); stateRef.current.time = t }
    const onError = (e) => setError(typeof e === 'string' ? e : e?.message || 'Failed to load audio')

    ws.on('ready', onReady)
    ws.on('play', onPlay)
    ws.on('pause', onPause)
    ws.on('finish', onFinish)
    ws.on('timeupdate', onTimeUpdate)
    ws.on('error', onError)

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [url, height, waveColor, progressColor, cursorColor])

  // A new file starts from the top.
  useEffect(() => { stateRef.current.time = 0; setCurrentTime(0) }, [url])

  const toggle = () => wsRef.current?.playPause()
  const skip = (seconds) => {
    const ws = wsRef.current
    if (!ws) return
    ws.setTime(Math.max(0, Math.min(ws.getDuration(), ws.getCurrentTime() + seconds)))
  }
  const seek = (time, { play } = {}) => {
    const ws = wsRef.current
    if (!ws) return
    ws.setTime(Math.max(0, Math.min(ws.getDuration() || time, time)))
    if (play && !ws.isPlaying()) ws.play()
  }
  const setVolume = (v) => { stateRef.current.volume = v; wsRef.current?.setVolume(v) }
  const setRate = (r) => { stateRef.current.rate = r; wsRef.current?.setPlaybackRate(r, true) }

  return {
    containerRef,
    isPlaying, isReady, currentTime, duration, error,
    toggle, skip, seek, setVolume, setRate,
  }
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
