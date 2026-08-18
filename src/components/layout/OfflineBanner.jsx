import { useEffect, useState } from 'react'

/** F9 E-NET — 오프라인 시 전체화면 배너, 온라인 복귀 시 자동으로 사라짐 */
export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="alert"
      className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-3 bg-black/90 text-white"
    >
      <p className="text-lg font-medium">인터넷 연결이 끊겼어요</p>
      <p className="text-sm text-white/60">온라인 상태가 되면 자동으로 다시 시도합니다</p>
    </div>
  )
}
