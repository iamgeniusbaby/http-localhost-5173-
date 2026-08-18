import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, Stars } from '@react-three/drei'
import Earth, { EARTH_RADIUS } from './Earth'
import LandmarkPin from './LandmarkPin'
import CameraRig from './CameraRig'
import { getSunDirection } from '../../lib/geo'
import { landmarks } from '../../data/landmarks'
import { useAppStore } from '../../store/useAppStore'

export default function GlobeScene({ weatherById, activeScene, showStars = true, onContextLost }) {
  const controlsRef = useRef(null)
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const clearSelection = useAppStore((s) => s.clearSelection)
  const sunDir = getSunDirection(new Date(), 8)

  return (
    <Canvas
      camera={{ position: [0, 1.5, EARTH_RADIUS + 4], fov: 45 }}
      onPointerMissed={() => clearSelection()}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        // F1.7 — WebGL 컨텍스트 로스트 시 폴백 전환
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost?.()
        })
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[sunDir.x, sunDir.y, sunDir.z]}
        intensity={(activeScene?.lightIntensity ?? 1.15) * 2.4}
        color={activeScene?.lightColor ?? '#ffffff'}
      />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      {showStars && <Stars radius={90} depth={50} count={3000} factor={2.5} fade speed={0.3} />}
      {landmarks.map((landmark) => (
        <LandmarkPin
          key={landmark.id}
          landmark={landmark}
          weather={weatherById?.[landmark.id]}
          isSelected={selectedPlace?.id === landmark.id}
        />
      ))}
      <CameraControls
        ref={controlsRef}
        minDistance={EARTH_RADIUS + 1.15}
        maxDistance={EARTH_RADIUS + 6}
        smoothTime={0.9}
        dollySpeed={0.4}
      />
      <CameraRig controlsRef={controlsRef} />
    </Canvas>
  )
}
