import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { countryCities } from '../../data/countryCities'
import { getWeatherInfo } from '../../data/weatherCodes'
import { useCountryCitiesWeather } from '../../hooks/useWeather'
import { useAppStore } from '../../store/useAppStore'

const WIDTH = 320
const HEIGHT = 220
const PAD = 28

function celsiusTo(unit, c) {
  if (c == null) return null
  return unit === 'f' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

/** F2 — 국가를 눌렀을 때 인구 상위 지역을 단순한 산점도 지도로 보여주고, 클릭해 날씨를 확인한다 */
export default function CountryMapModal({ countryCode, countryName, onClose }) {
  const unit = useAppStore((s) => s.unit)
  const selectPlace = useAppStore((s) => s.selectPlace)
  const cities = useMemo(() => countryCities[countryCode] ?? [], [countryCode])
  const weatherQuery = useCountryCitiesWeather(countryCode, cities)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const projected = useMemo(() => {
    if (cities.length === 0) return []
    const lats = cities.map((c) => c.lat)
    const lons = cities.map((c) => c.lon)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const latSpan = Math.max(maxLat - minLat, 0.5)
    const lonSpan = Math.max(maxLon - minLon, 0.5)
    const maxPop = Math.max(...cities.map((c) => c.population))
    return cities.map((c) => ({
      ...c,
      x: PAD + ((c.lon - minLon) / lonSpan) * (WIDTH - PAD * 2),
      y: PAD + ((maxLat - c.lat) / latSpan) * (HEIGHT - PAD * 2),
      r: 4 + (c.population / maxPop) * 10,
    }))
  }, [cities])

  function handlePick(city) {
    selectPlace({
      id: city.id,
      name: city.name,
      city: city.name,
      country: { ko: countryName, en: countryName },
      lat: city.lat,
      lon: city.lon,
      countryCode,
      icon: '🏙️',
      isLandmark: false,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/85 p-5 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-semibold">{countryName} 주요 도시 날씨</div>
              <div className="text-xs text-white/50">인구가 많은 지역을 눌러 날씨를 확인하세요</div>
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {cities.length === 0 ? (
            <p className="mt-6 text-sm text-white/60">이 국가의 도시 데이터가 아직 없어요.</p>
          ) : (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 w-full rounded-lg bg-white/5">
              {projected.map((city) => {
                const w = weatherQuery.data?.[city.id]
                const info = w?.current ? getWeatherInfo(w.current.weather_code) : null
                return (
                  <g
                    key={city.id}
                    transform={`translate(${city.x}, ${city.y})`}
                    className="cursor-pointer"
                    onClick={() => handlePick(city)}
                  >
                    <circle r={city.r} fill="#ffd166" fillOpacity={0.25} stroke="#ffd166" strokeWidth={1.2} />
                    <circle r={2.5} fill="#ff5a5f" />
                    <text y={-city.r - 6} textAnchor="middle" fontSize="9" fill="#ffffff" fillOpacity={0.9}>
                      {city.name.ko}
                    </text>
                    <text y={-city.r - 6 + 11} textAnchor="middle" fontSize="8" fill="#ffffff" fillOpacity={0.6}>
                      {info && w?.current ? `${info.icon} ${celsiusTo(unit, w.current.temperature_2m)}°` : '···'}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}

          <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto">
            {cities.map((city) => {
              const w = weatherQuery.data?.[city.id]
              const info = w?.current ? getWeatherInfo(w.current.weather_code) : null
              return (
                <li key={city.id}>
                  <button
                    onClick={() => handlePick(city)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition hover:bg-white/10"
                  >
                    <span>
                      {city.name.ko} <span className="text-[11px] text-white/40">인구 {city.population.toLocaleString()}</span>
                    </span>
                    <span className="text-white/80">
                      {info && w?.current ? `${info.icon} ${celsiusTo(unit, w.current.temperature_2m)}°` : '···'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
