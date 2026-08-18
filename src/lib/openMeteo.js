const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

const CURRENT_FIELDS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m'
const HOURLY_FIELDS = 'temperature_2m,weather_code,precipitation_probability'
const DAILY_FIELDS = 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max'

class WeatherApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'WeatherApiError'
    this.status = status
  }
}

async function requestJson(url) {
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new WeatherApiError('network error', 0)
  }
  if (!res.ok) {
    throw new WeatherApiError(`request failed: ${res.status}`, res.status)
  }
  return res.json()
}

/**
 * PRD 9.3 배치 전략 — 여러 좌표를 콤마로 묶어 1회 요청으로 전체 랜드마크 날씨를 가져온다.
 * 반환값: { [landmarkId]: forecastResult }
 */
export async function fetchForecastBatch(landmarksList) {
  const lats = landmarksList.map((l) => l.lat).join(',')
  const lons = landmarksList.map((l) => l.lon).join(',')
  const url =
    `${FORECAST_URL}?latitude=${lats}&longitude=${lons}` +
    `&current=${CURRENT_FIELDS}&hourly=${HOURLY_FIELDS}&daily=${DAILY_FIELDS}` +
    `&timezone=auto&forecast_days=7`

  const data = await requestJson(url)
  // 다중 좌표 요청 시 응답은 좌표 순서와 동일한 배열로 온다.
  const results = Array.isArray(data) ? data : [data]
  const byId = {}
  landmarksList.forEach((landmark, i) => {
    byId[landmark.id] = results[i]
  })
  return byId
}

export async function fetchForecastSingle(lat, lon) {
  const url =
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=${CURRENT_FIELDS}&hourly=${HOURLY_FIELDS}&daily=${DAILY_FIELDS}` +
    `&timezone=auto&forecast_days=7`
  return requestJson(url)
}

export async function searchGeocoding(query) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=8&language=ko&format=json`
  const data = await requestJson(url)
  return data.results ?? []
}

export { WeatherApiError }
