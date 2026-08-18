import { AnimatePresence, motion } from 'framer-motion'
import ParticleOverlay from './ParticleOverlay'

const SPACE_GRADIENT = 'linear-gradient(to bottom, #000000, #060912 55%, #0b1224)'

/** F4.1/F4.2 — 시간대×날씨 배경을 800ms 크로스페이드로 전환 */
export default function BackgroundLayer({ activeScene, precipitationIntensity = 0.5 }) {
  const gradient = activeScene ? `linear-gradient(to bottom, ${activeScene.gradient.join(', ')})` : SPACE_GRADIENT
  const key = activeScene?.key ?? 'space'
  // 별은 3D 지구본 씬의 <Stars>가 담당하므로 DOM 파티클에서는 비/눈만 표현
  const domParticleType = activeScene?.particle === 'rain' || activeScene?.particle === 'storm' || activeScene?.particle === 'snow'
    ? activeScene.particle
    : 'none'

  return (
    <div className="fixed inset-0 -z-10">
      <AnimatePresence>
        <motion.div
          key={key}
          className="absolute inset-0"
          style={{ background: gradient, filter: activeScene?.blur ? 'blur(2px) saturate(0.7)' : 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      <ParticleOverlay type={domParticleType} intensity={precipitationIntensity} />
    </div>
  )
}
