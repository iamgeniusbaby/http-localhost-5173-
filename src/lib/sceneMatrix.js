// PRD F4 — 배경 연출: 시간대 그라디언트 × 날씨 오버레이를 레이어 합성해
// 4(시간대) × 6(날씨그룹) = 24개 조합을 하드코딩하지 않고 생성한다.

const HOUR_MS = 60 * 60 * 1000

/** "YYYY-MM-DDTHH:MM" 형태의 로컬 wall-clock 문자열을 UTC로 강제 파싱해 시각 비교에만 사용 */
function parseWallClock(isoLocal) {
  return new Date(`${isoLocal}:00Z`)
}

/**
 * 랜드마크 현지 시각이 dawn/day/dusk/night 중 어디에 속하는지 판정.
 * @param {number} utcOffsetSeconds - Open-Meteo 응답의 utc_offset_seconds
 * @param {string} sunriseIso - daily.sunrise[0]
 * @param {string} sunsetIso - daily.sunset[0]
 * @param {Date} now
 */
export function getTimePeriod(utcOffsetSeconds, sunriseIso, sunsetIso, now = new Date()) {
  const nowWallMs = now.getTime() + utcOffsetSeconds * 1000
  const sunriseMs = parseWallClock(sunriseIso).getTime()
  const sunsetMs = parseWallClock(sunsetIso).getTime()

  // Date +/- number silently string-concatenates instead of adding, so
  // compare plain numeric timestamps here rather than Date objects.
  if (nowWallMs >= sunriseMs - HOUR_MS && nowWallMs <= sunriseMs + HOUR_MS) return 'dawn'
  if (nowWallMs >= sunsetMs - HOUR_MS && nowWallMs <= sunsetMs + HOUR_MS) return 'dusk'
  if (nowWallMs > sunriseMs + HOUR_MS && nowWallMs < sunsetMs - HOUR_MS) return 'day'
  return 'night'
}

const TIME_GRADIENTS = {
  dawn: { colors: ['#3b2560', '#8a4a72', '#f0875a'], lightColor: '#ffb37a', lightIntensity: 0.6 },
  day: { colors: ['#2f7fd1', '#8fd0f0', '#dff3ff'], lightColor: '#fff6e0', lightIntensity: 1.15 },
  dusk: { colors: ['#d9662f', '#7a3a5c', '#241636'], lightColor: '#ff8a4c', lightIntensity: 0.5 },
  night: { colors: ['#040714', '#0c1230', '#182047'], lightColor: '#8fa8ff', lightIntensity: 0.15 },
}

const WEATHER_OVERLAYS = {
  clear: { tint: null, mix: 0, particle: (tp) => (tp === 'night' ? 'stars' : 'none'), blur: false },
  cloudy: { tint: '#8b8f9c', mix: 0.45, particle: () => 'none', blur: false },
  fog: { tint: '#b9c0c9', mix: 0.65, particle: () => 'none', blur: true },
  rain: { tint: '#33475c', mix: 0.55, particle: () => 'rain', blur: false },
  snow: { tint: '#dfe6ee', mix: 0.5, particle: () => 'snow', blur: false },
  storm: { tint: '#12141c', mix: 0.7, particle: () => 'storm', blur: false },
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mixColors(hexA, hexB, t) {
  const [ar, ag, ab] = hexToRgb(hexA)
  const [br, bg, bb] = hexToRgb(hexB)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const b = Math.round(ab + (bb - ab) * t)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * @param {string} weatherGroup - clear|cloudy|fog|rain|snow|storm
 * @param {string} timePeriod - dawn|day|dusk|night
 */
export function getSceneKey(weatherGroup, timePeriod) {
  const time = TIME_GRADIENTS[timePeriod] ?? TIME_GRADIENTS.day
  const overlay = WEATHER_OVERLAYS[weatherGroup] ?? WEATHER_OVERLAYS.clear

  const gradient = overlay.tint ? time.colors.map((c) => mixColors(c, overlay.tint, overlay.mix)) : time.colors

  return {
    key: `${timePeriod}-${weatherGroup}`,
    gradient,
    particle: overlay.particle(timePeriod),
    blur: overlay.blur,
    lightColor: overlay.tint ? mixColors(time.lightColor, overlay.tint, overlay.mix * 0.6) : time.lightColor,
    lightIntensity: time.lightIntensity * (1 - overlay.mix * 0.5),
  }
}
