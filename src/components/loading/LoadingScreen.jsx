import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

/** F8 — L1 전체화면 로더. 실제 텍스처/날씨 로딩 진행률과 연동(가짜 프로그레스 금지) */
export default function LoadingScreen({ weatherLoading }) {
  const { progress: textureProgress } = useProgress()
  const [showSlowHint, setShowSlowHint] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowHint(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  const weatherProgress = weatherLoading ? 40 : 100
  const combined = Math.round(textureProgress * 0.7 + weatherProgress * 0.3)

  const label =
    textureProgress < 100 ? '지구 불러오는 중…' : weatherLoading ? '날씨 데이터 동기화 중…' : '랜드마크 배치 중…'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
    >
      <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      <p className="mt-6 text-sm text-white/70">{label}</p>
      <div className="mt-4 h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-white transition-[width] duration-200" style={{ width: `${combined}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/40">{combined}%</p>
      {showSlowHint && (
        <p className="mt-6 text-xs text-amber-300/80">네트워크가 느린 것 같아요. 조금만 더 기다려 주세요</p>
      )}
    </div>
  )
}
