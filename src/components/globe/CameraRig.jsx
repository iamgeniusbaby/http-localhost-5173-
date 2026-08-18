import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '../../store/useAppStore'
import { latLonToVector3 } from '../../lib/geo'
import { EARTH_RADIUS } from './Earth'

const FOCUS_DISTANCE = EARTH_RADIUS + 1.3
const SPACE_DISTANCE = EARTH_RADIUS + 4
const IDLE_ROTATE_SPEED = 0.18 // rad/s (PRD F1.3 기본값 0.05보다 빠르게 조정)
const IDLE_RESUME_DELAY = 4000

const KEY_ROTATE_SPEED = 1.2 // rad/s
const GAMEPAD_ROTATE_SPEED = 1.8 // rad/s (스틱 최대 편향 시)
const GAMEPAD_DEADZONE = 0.15

const ROTATE_KEYS = {
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function isTypingTarget(el) {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

function applyDeadzone(value, deadzone) {
  return Math.abs(value) < deadzone ? 0 : value
}

/** 선택 지점 플라이투(F1) + 유휴 자동 자전(F1.3) + 키보드/게임패드 수동 회전 */
export default function CameraRig({ controlsRef }) {
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const isInteractingRef = useRef(false)
  const idleReadyRef = useRef(true)
  const idleTimerRef = useRef(null)
  const pressedKeysRef = useRef(new Set())
  const manualActiveRef = useRef(false)

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

  // 키보드 방향키/WASD로 지구본 회전 (검색창 등 입력 중에는 무시)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.code in ROTATE_KEYS) || isTypingTarget(document.activeElement)) return
      e.preventDefault()
      pressedKeysRef.current.add(e.code)
    }
    const onKeyUp = (e) => {
      pressedKeysRef.current.delete(e.code)
    }
    const onBlur = () => {
      pressedKeysRef.current.clear()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    // 키보드 입력 합산
    let azimuthInput = 0
    let polarInput = 0
    for (const code of pressedKeysRef.current) {
      const [az, pol] = ROTATE_KEYS[code] ?? [0, 0]
      azimuthInput += az
      polarInput += pol
    }

    // 게임패드(D패드/왼쪽 스틱) 입력 합산
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : null
    if (pads) {
      for (const pad of pads) {
        if (!pad || !pad.connected) continue
        const stickX = applyDeadzone(pad.axes[0] ?? 0, GAMEPAD_DEADZONE)
        const stickY = applyDeadzone(pad.axes[1] ?? 0, GAMEPAD_DEADZONE)
        azimuthInput += stickX
        polarInput += stickY
        if (pad.buttons[14]?.pressed) azimuthInput -= 1 // D-pad left
        if (pad.buttons[15]?.pressed) azimuthInput += 1 // D-pad right
        if (pad.buttons[12]?.pressed) polarInput -= 1 // D-pad up
        if (pad.buttons[13]?.pressed) polarInput += 1 // D-pad down
      }
    }

    azimuthInput = Math.max(-1, Math.min(1, azimuthInput))
    polarInput = Math.max(-1, Math.min(1, polarInput))

    const manualActive = azimuthInput !== 0 || polarInput !== 0
    if (manualActive) {
      if (!manualActiveRef.current) {
        manualActiveRef.current = true
        isInteractingRef.current = true
        idleReadyRef.current = false
        clearTimeout(idleTimerRef.current)
      }
      const speed = pressedKeysRef.current.size > 0 ? KEY_ROTATE_SPEED : GAMEPAD_ROTATE_SPEED
      controls.rotate(azimuthInput * speed * delta, polarInput * speed * delta, false)
    } else if (manualActiveRef.current) {
      manualActiveRef.current = false
      isInteractingRef.current = false
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        idleReadyRef.current = true
      }, IDLE_RESUME_DELAY)
    }

    if (prefersReducedMotion) return
    if (isInteractingRef.current || !idleReadyRef.current) return
    controls.rotate(IDLE_ROTATE_SPEED * delta, 0, false)
  })

  return null
}
