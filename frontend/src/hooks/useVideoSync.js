import { useEffect, useRef } from 'react'

/**
 * Keep a muted <video> preview in step with the audio player.
 *
 * The audio is the master clock. Edits cut the audio, so the video has to
 * jump over the same cuts: `timeline` maps edited-audio time to source-video
 * time (see backend services/video.py). Null means no cuts yet.
 *
 * A segment whose source is shorter than its output (a re-voiced word with a
 * longer take) freezes on its last frame for the remainder.
 */

const DRIFT = 0.12 // seconds of slack before we force a seek

function locate(timeline, t) {
  if (!timeline?.length) return { src: t, hold: false }
  for (const seg of timeline) {
    if (t < seg.out_end) {
      const into = Math.max(0, t - seg.out_start)
      const len = seg.src_end - seg.src_start
      return into >= len ? { src: seg.src_end, hold: true } : { src: seg.src_start + into, hold: false }
    }
  }
  return { src: timeline[timeline.length - 1].src_end, hold: true }
}

export function useVideoSync({ video, player, timeline, rate = 1 }) {
  const timelineRef = useRef(timeline)
  timelineRef.current = timeline

  // While playing: follow the audio every frame, seeking at cuts.
  useEffect(() => {
    if (!video || !player.isPlaying) return undefined
    let raf
    const tick = () => {
      const { src, hold } = locate(timelineRef.current, player.getTime())
      if (Math.abs(video.currentTime - src) > DRIFT) video.currentTime = src
      if (hold) {
        if (!video.paused) video.pause()
      } else if (video.paused) {
        video.play().catch(() => {})
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      video.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.isPlaying, video])

  // While paused: show the frame under the playhead (scrubbing, word clicks).
  useEffect(() => {
    if (!video || player.isPlaying) return
    const { src } = locate(timeline, player.currentTime)
    if (Math.abs(video.currentTime - src) > 0.04) video.currentTime = src
  }, [player.currentTime, player.isPlaying, timeline, video])

  useEffect(() => {
    if (video) video.playbackRate = rate
  }, [rate, video])
}
