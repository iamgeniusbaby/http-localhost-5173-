import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '../../store/useAppStore'
import { latLonToVector3 } from '../../lib/geo'
import { EARTH_RADIUS } from './Earth'

const FOCUS_DISTANCE = EARTH_RADIUS + 1.3
const SPACE_DISTANCE = EARTH_RADIUS + 4
const IDLE_ROTATE_SPEED = 0.18 // rad/s (PRD F1.3 기본값 0.05보다 빠르게 조정)
const IDLE_RESUME_DELAY = 4000

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 선택 지점 플라이투(F1) + 유휴 자동 자전(F1.3, 상호작용 시 정지) */
export default function CameraRig({ controlsRef }) {
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const isInteractingRef = useRef(false)
  const idleReadyRef = useRef(true)
  const idleTimerRef = useRef(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    if (selectedPlace) {
      const pos = latLonToVector3(selectedPlace.lat, selectedPlace.lon, FOCUS_DISTANCE)
      controls.setLookAt(pos.x, pos.y, pos.z, 0, 0, 0, !prefersReducedMotion)
    } else {
      controls.setLookAt(0, 1.5, SPACE_DISTANCE, 0, 0, 0, !prefersReducedMotion)
    }
  }, [selectedPlace, controlsRef])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const onStart = () => {
      isInteractingRef.current = true
      idleReadyRef.current = false
      clearTimeout(idleTimerRef.current)
    }
    const onEnd = () => {
      isInteractingRef.current = false
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        idleReadyRef.current = true
      }, IDLE_RESUME_DELAY)
    }

    controls.addEventListener('controlstart', onStart)
    controls.addEventListener('controlend', onEnd)
    return () => {
      controls.removeEventListener('controlstart', onStart)
      controls.removeEventListener('controlend', onEnd)
      clearTimeout(idleTimerRef.current)
    }
  }, [controlsRef])

  useFrame((_, delta) => {
    if (prefersReducedMotion) return
    const controls = controlsRef.current
    if (!controls || isInteractingRef.current || !idleReadyRef.current) return
    controls.rotate(IDLE_ROTATE_SPEED * delta, 0, false)
  })

  return null
}
