import { Vector3 } from 'three'

/** 위경도 → 구 표면의 3D 좌표 (equirectangular 텍스처 기준) */
export function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

/**
 * 현재 UTC 시각 기준 태양이 남중(정오)하는 경도(subsolar longitude) 근사값.
 * F1.4 주야 경계선을 방향광 위치만으로 단순 표현하기 위해 사용.
 */
export function getSubsolarLongitude(date = new Date()) {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  let lon = (12 - utcHours) * 15
  // normalize to [-180, 180]
  lon = ((lon + 180) % 360 + 360) % 360 - 180
  return lon
}

/** subsolar longitude(위도는 0 근사) → 방향광 위치 벡터 */
export function getSunDirection(date = new Date(), distance = 10) {
  return latLonToVector3(0, getSubsolarLongitude(date), distance)
}

const EARTH_RADIUS_KM = 6371

/** 두 위경도 지점 사이의 대권거리(km) — 주변 관광지 탐색에 사용 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}
