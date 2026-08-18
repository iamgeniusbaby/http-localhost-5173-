import { useMemo } from 'react'
import { getWeatherInfo } from '../../data/weatherCodes'
import { useAppStore } from '../../store/useAppStore'

function pad(n) {
  return String(n).padStart(2, '0')
}

function celsiusTo(unit, c) {
  if (c == null) return null
  return unit === 'f' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

/** utc_offset_seconds 기준 현재 로컬 시각을 hourly.time과 같은 'YYYY-MM-DDTHH:00' 포맷으로 변환 */
function currentHourKey(nowMs, utcOffsetSeconds) {
  const wall = new Date(nowMs + utcOffsetSeconds * 1000)
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}T${pad(wall.getUTCHours())}:00`
}

/** F3.5 — 시간별 예보 24시간, 수평 스크롤 */
export default function HourlyForecast({ hourly, utcOffsetSeconds }) {
  const unit = useAppStore((s) => s.unit)

  const items = useMemo(() => {
    if (!hourly?.time?.length) return []
    const key = currentHourKey(Date.now(), utcOffsetSeconds ?? 0)
    let startIdx = hourly.time.findIndex((t) => t >= key)
    if (startIdx === -1) startIdx = 0
    return hourly.time.slice(startIdx, startIdx + 24).map((t, i) => {
      const idx = startIdx + i
      return {
        time: t,
        hourLabel: i === 0 ? '지금' : `${pad(Number(t.slice(11, 13)))}시`,
        temp: hourly.temperature_2m?.[idx],
        code: hourly.weather_code?.[idx],
        precipProb: hourly.precipitation_probability?.[idx],
      }
    })
  }, [hourly, utcOffsetSeconds])

  if (items.length === 0) return null

  return (
    <div className="mt-4">
      <div className="text-xs font-medium text-white/50">시간별 예보</div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {items.map((item) => {
          const info = getWeatherInfo(item.code)
          return (
            <div
              key={item.time}
              className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-white/5 px-2.5 py-2 text-center"
            >
              <div className="text-[11px] text-white/50">{item.hourLabel}</div>
              <div className="text-lg leading-none">{info.icon}</div>
              <div className="text-xs font-medium text-white">
                {celsiusTo(unit, item.temp)}°
              </div>
              {item.precipProb != null && (
                <div className="text-[10px] text-sky-300/80">💧{item.precipProb}%</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
