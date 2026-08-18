import { useMemo } from 'react'

const BASE_COUNT = { stars: 70, rain: 80, snow: 55, storm: 90 }

/** F4.3 — 날씨별 파티클(비/눈/별), 강수량에 비례해 밀도 조절 */
export default function ParticleOverlay({ type, intensity = 0.6 }) {
  const count = Math.max(10, Math.round((BASE_COUNT[type] ?? 40) * Math.min(1, Math.max(0.15, intensity))))

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: type === 'snow' ? 5 + Math.random() * 4 : type === 'star' ? 2 + Math.random() * 3 : 0.7 + Math.random() * 0.6,
      scale: 0.6 + Math.random() * 0.9,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, type])

  if (!type || type === 'none') return null

  const particleClass =
    type === 'rain' || type === 'storm' ? 'particle-rain' : type === 'snow' ? 'particle-snow' : 'particle-star'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className={particleClass}
          style={{
            left: `${p.left}%`,
            top: particleClass === 'particle-star' ? `${p.top}%` : undefined,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.scale})`,
          }}
        />
      ))}
      {type === 'storm' && <div className="storm-flash" />}
    </div>
  )
}
