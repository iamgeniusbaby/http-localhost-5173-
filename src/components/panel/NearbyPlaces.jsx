import { useMemo } from 'react'
import { findNearbyPlaces } from '../../data/placesPool'
import { getWeatherInfo } from '../../data/weatherCodes'
import { useNearbyWeather } from '../../hooks/useWeather'
import { useAppStore } from '../../store/useAppStore'

function celsiusTo(unit, c) {
  if (c == null) return null
  return unit === 'f' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

/** F1 — 선택 지점 근처 관광지/도시 날씨를 동시에 보여주고, 클릭하면 그곳으로 이동한다 */
export default function NearbyPlaces({ place, landmarksWeather }) {
  const unit = useAppStore((s) => s.unit)
  const selectPlace = useAppStore((s) => s.selectPlace)

  const nearby = useMemo(() => findNearbyPlaces(place, { limit: 5, maxKm: 1200 }), [place])
  const cityCandidates = useMemo(() => nearby.filter((p) => p.type === 'city'), [nearby])
  const nearbyCitiesQuery = useNearbyWeather(cityCandidates)

  if (!place || nearby.length === 0) return null

  function weatherFor(item) {
    if (item.type === 'landmark') return landmarksWeather?.[item.id]
    return nearbyCitiesQuery.data?.[item.id]
  }

  function handleSelect(item) {
    selectPlace({
      id: item.id,
      name: item.name,
      city: item.city,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      timezone: item.timezone,
      countryCode: item.countryCode,
      icon: item.icon,
      isLandmark: item.type === 'landmark',
    })
  }

  return (
    <div className="mt-4">
      <div className="text-xs font-medium text-white/50">근처 관광지 날씨</div>
      <ul className="mt-2 space-y-1.5">
        {nearby.map((item) => {
          const w = weatherFor(item)
          const info = w?.current ? getWeatherInfo(w.current.weather_code) : null
          const isLoading = item.type === 'city' && nearbyCitiesQuery.isLoading
          return (
            <li key={item.id}>
              <button
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span>{item.icon}</span>
                  <span className="font-medium text-white">{item.name?.ko}</span>
                  <span className="text-[11px] text-white/40">{Math.round(item.distanceKm)}km</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  {isLoading && <span className="text-xs text-white/40">…</span>}
                  {info && (
                    <>
                      <span>{info.icon}</span>
                      <span>{celsiusTo(unit, w.current.temperature_2m)}°</span>
                    </>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
