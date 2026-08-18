import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getWeatherInfo } from '../../data/weatherCodes'
import { countryCities } from '../../data/countryCities'
import { useAppStore } from '../../store/useAppStore'
import WeatherSkeleton from './WeatherSkeleton'
import HourlyForecast from './HourlyForecast'
import NearbyPlaces from './NearbyPlaces'
import CountryMapModal from './CountryMapModal'

const KOREA_OFFSET_SECONDS = 9 * 3600

function pad(n) {
  return String(n).padStart(2, '0')
}

/** utc_offset_seconds 기준 "현지 시각"을 초 단위로 표시 (F3.2) */
function formatLocalTime(nowMs, utcOffsetSeconds) {
  const wall = new Date(nowMs + utcOffsetSeconds * 1000)
  return `${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:${pad(wall.getUTCSeconds())}`
}

function formatKoreaDiff(utcOffsetSeconds) {
  const diffHours = (utcOffsetSeconds - KOREA_OFFSET_SECONDS) / 3600
  if (diffHours === 0) return '한국과 시차 없음'
  const abs = Math.abs(diffHours)
  const label = Number.isInteger(abs) ? `${abs}시간` : `${abs}시간`
  return diffHours > 0 ? `한국보다 ${label} 빠름` : `한국보다 ${label} 느림`
}

function celsiusTo(unit, c) {
  if (c == null) return null
  return unit === 'f' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

function parseWallClock(isoLocal) {
  return new Date(`${isoLocal}:00Z`)
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg bg-white/5 p-3">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  )
}

export default function WeatherDetailPanel({ place, weather, isLoading, isError, onRetry, onClose, landmarksWeather }) {
  const unit = useAppStore((s) => s.unit)
  const [nowMs, setNowMs] = useState(Date.now())
  const [showCountryMap, setShowCountryMap] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setShowCountryMap(false)
  }, [place?.id])

  if (!place) return null

  const hasCountryMap = place.countryCode && countryCities[place.countryCode]?.length > 0

  const unitLabel = unit === 'f' ? '°F' : '°C'
  const current = weather?.current
  const daily = weather?.daily
  const utcOffsetSeconds = weather?.utc_offset_seconds ?? 0
  const weatherInfo = current ? getWeatherInfo(current.weather_code) : null

  let dayProgress = null
  if (daily?.sunrise?.[0] && daily?.sunset?.[0]) {
    const sunrise = parseWallClock(daily.sunrise[0])
    const sunset = parseWallClock(daily.sunset[0])
    const wall = new Date(nowMs + utcOffsetSeconds * 1000)
    const pct = ((wall - sunrise) / (sunset - sunrise)) * 100
    dayProgress = Math.min(100, Math.max(0, pct))
  }

  return (
    <>
    <motion.aside
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="pointer-events-auto fixed right-4 top-20 z-20 max-h-[calc(100vh-6rem)] w-[min(92vw,380px)] overflow-y-auto rounded-2xl border border-white/10 bg-black/50 p-5 text-white shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>{place.icon ?? '📍'}</span>
            <span>{place.name?.ko ?? place.name}</span>
          </div>
          <div className="text-sm text-white/60">
            {place.city?.ko ?? ''} {place.country?.ko ? `· ${place.country.ko}` : ''}
          </div>
          {hasCountryMap && (
            <button
              onClick={() => setShowCountryMap(true)}
              className="mt-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/20"
            >
              🗺️ {place.country?.ko ?? ''} 주요 도시 날씨 보기
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="상세 패널 닫기"
          className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      {isLoading && (
        <div className="mt-4">
          <WeatherSkeleton />
        </div>
      )}

      {isError && !isLoading && (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm">
          <p className="text-red-200">날씨 정보를 불러오지 못했어요</p>
          <button
            onClick={onRetry}
            className="mt-2 rounded-md bg-red-400/20 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-400/30"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && current && (
        <div className="mt-4">
          <div className="flex items-end gap-3">
            <div className="text-5xl font-light">
              {celsiusTo(unit, current.temperature_2m)}
              {unitLabel}
            </div>
            <div className="pb-1 text-sm text-white/60">
              체감 {celsiusTo(unit, current.apparent_temperature)}
              {unitLabel}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-white/80">
            <span className="text-xl">{weatherInfo?.icon}</span>
            <span>{weatherInfo?.label}</span>
            <span className="text-white/40">· {current.is_day ? '낮' : '밤'}</span>
          </div>

          <div className="mt-3 flex items-baseline justify-between rounded-lg bg-white/5 px-3 py-2">
            <div className="font-mono text-2xl tabular-nums">{formatLocalTime(nowMs, utcOffsetSeconds)}</div>
            <div className="text-right text-xs text-white/50">
              <div>UTC{utcOffsetSeconds >= 0 ? '+' : ''}{utcOffsetSeconds / 3600}</div>
              <div>{formatKoreaDiff(utcOffsetSeconds)}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard label="습도" value={`${current.relative_humidity_2m}%`} />
            <StatCard label="바람" value={`${Math.round(current.wind_speed_10m)} km/h`} />
            <StatCard label="강수량" value={`${current.precipitation} mm`} />
            <StatCard label="기압" value={`${Math.round(current.surface_pressure)} hPa`} />
            {daily?.uv_index_max?.[0] != null && <StatCard label="자외선지수" value={daily.uv_index_max[0].toFixed(1)} />}
            {daily?.temperature_2m_max?.[0] != null && (
              <StatCard
                label="오늘 최고/최저"
                value={`${celsiusTo(unit, daily.temperature_2m_max[0])}° / ${celsiusTo(unit, daily.temperature_2m_min[0])}°`}
              />
            )}
          </div>

          {dayProgress != null && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-white/50">
                <span>🌅 {daily.sunrise[0].slice(11)}</span>
                <span>🌇 {daily.sunset[0].slice(11)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-amber-300/80" style={{ width: `${dayProgress}%` }} />
              </div>
            </div>
          )}

          <HourlyForecast hourly={weather?.hourly} utcOffsetSeconds={utcOffsetSeconds} />
          <NearbyPlaces place={place} landmarksWeather={landmarksWeather} />
        </div>
      )}
    </motion.aside>

    {showCountryMap && hasCountryMap && (
      <CountryMapModal
        countryCode={place.countryCode}
        countryName={place.country?.ko ?? ''}
        onClose={() => setShowCountryMap(false)}
      />
    )}
    </>
  )
}
