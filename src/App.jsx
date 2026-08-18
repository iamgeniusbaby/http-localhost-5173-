import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import GlobeScene from './components/globe/GlobeScene'
import BackgroundLayer from './components/background/BackgroundLayer'
import WeatherDetailPanel from './components/panel/WeatherDetailPanel'
import TopBar from './components/layout/TopBar'
import LoadingScreen from './components/loading/LoadingScreen'
import OfflineBanner from './components/layout/OfflineBanner'
import { useAllLandmarksWeather, useSingleLocationWeather } from './hooks/useWeather'
import { useAppStore } from './store/useAppStore'
import { getWeatherInfo } from './data/weatherCodes'
import { getTimePeriod, getSceneKey } from './lib/sceneMatrix'

function isWebgl2Supported() {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

export default function App() {
  const [webglOk, setWebglOk] = useState(() => isWebgl2Supported())
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [activeScene, setActiveScene] = useState(null)

  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const clearSelection = useAppStore((s) => s.clearSelection)

  const { progress: textureProgress } = useProgress()
  const batchQuery = useAllLandmarksWeather()
  const singleQuery = useSingleLocationWeather(
    selectedPlace?.lat,
    selectedPlace?.lon,
    !!selectedPlace && !selectedPlace.isLandmark,
  )

  // F8.4 — 로딩 화면 최소 노출 시간 400ms 보장
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // ESC — 지구본 뷰로 복귀 (7.1 플로우 8단계)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSelection])

  const currentWeather = selectedPlace
    ? selectedPlace.isLandmark
      ? batchQuery.data?.[selectedPlace.id]
      : singleQuery.data
    : null

  const currentIsLoading = selectedPlace
    ? selectedPlace.isLandmark
      ? batchQuery.isLoading
      : singleQuery.isLoading
    : false

  const currentIsError = selectedPlace
    ? selectedPlace.isLandmark
      ? batchQuery.isError
      : singleQuery.isError
    : false

  // F4 — 배경 씬은 새 데이터가 준비된 뒤에만 전환 (로딩 중엔 이전 배경 유지)
  useEffect(() => {
    if (!selectedPlace) {
      setActiveScene(null)
      return
    }
    if (!currentWeather?.current || !currentWeather?.daily) return
    const group = getWeatherInfo(currentWeather.current.weather_code).group
    const period = getTimePeriod(
      currentWeather.utc_offset_seconds ?? 0,
      currentWeather.daily.sunrise?.[0],
      currentWeather.daily.sunset?.[0],
    )
    setActiveScene(getSceneKey(group, period))
  }, [selectedPlace, currentWeather])

  const precipitationIntensity = useMemo(() => {
    const mm = currentWeather?.current?.precipitation ?? 0
    return Math.min(1, Math.max(0.2, mm / 4))
  }, [currentWeather])

  const showStars = !selectedPlace || activeScene?.particle === 'stars'
  const showLoadingScreen = !minTimeElapsed || batchQuery.isLoading || textureProgress < 100

  if (!webglOk) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
        <p className="text-lg font-medium">이 브라우저에서는 3D 지구본을 표시할 수 없어요</p>
        <p className="text-sm text-white/60">최신 Chrome, Edge, Safari, Firefox에서 다시 시도해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <BackgroundLayer activeScene={activeScene} precipitationIntensity={precipitationIntensity} />

      <GlobeScene
        weatherById={batchQuery.data}
        activeScene={activeScene}
        showStars={showStars}
        onContextLost={() => setWebglOk(false)}
      />

      <TopBar />

      <AnimatePresence>
        {selectedPlace && (
          <WeatherDetailPanel
            place={selectedPlace}
            weather={currentWeather}
            isLoading={currentIsLoading}
            isError={currentIsError}
            onRetry={() => (selectedPlace.isLandmark ? batchQuery.refetch() : singleQuery.refetch())}
            onClose={clearSelection}
          />
        )}
      </AnimatePresence>

      <footer className="pointer-events-none fixed inset-x-0 bottom-2 z-20 text-center text-[11px] text-white/30">
        Weather data by{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="pointer-events-auto underline">
          Open-Meteo.com
        </a>{' '}
        (CC BY 4.0)
      </footer>

      {showLoadingScreen && <LoadingScreen weatherLoading={batchQuery.isLoading} />}
      <OfflineBanner />
    </div>
  )
}
