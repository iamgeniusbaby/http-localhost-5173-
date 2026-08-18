import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { latLonToVector3 } from '../../lib/geo'
import { getWeatherInfo } from '../../data/weatherCodes'
import { useAppStore } from '../../store/useAppStore'
import { EARTH_RADIUS } from './Earth'

export default function LandmarkPin({ landmark, weather, isSelected }) {
  const position = useMemo(() => latLonToVector3(landmark.lat, landmark.lon, EARTH_RADIUS), [landmark.lat, landmark.lon])
  const normal = useMemo(() => position.clone().normalize(), [position])
  const groupRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()
  const hoveredId = useAppStore((s) => s.hoveredLandmarkId)
  const setHoveredId = useAppStore((s) => s.setHovered)
  const selectPlace = useAppStore((s) => s.selectPlace)

  // F2.2 — 지구 반대편 핀은 자동 숨김/투명도 감소
  useFrame(() => {
    if (!groupRef.current) return
    const camDir = camera.position.clone().normalize()
    const dot = normal.dot(camDir)
    groupRef.current.visible = dot > -0.1
  })

  const weatherInfo = weather ? getWeatherInfo(weather.current?.weather_code) : null
  const temp = weather?.current?.temperature_2m

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          setHoveredId(landmark.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          if (hoveredId === landmark.id) setHoveredId(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          selectPlace({ ...landmark, isLandmark: true })
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ff5a5f' : '#ffd166'} />
      </mesh>
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.05, 0.065, 32]} />
          <meshBasicMaterial color="#ff5a5f" transparent opacity={0.7} side={2} />
        </mesh>
      )}
      {hovered && (
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-black/80 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm">
            <span className="mr-1">{landmark.icon}</span>
            <span className="font-medium">{landmark.name.ko}</span>
            {weatherInfo && temp != null && (
              <span className="ml-2 text-white/80">
                {weatherInfo.icon} {Math.round(temp)}°C
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
