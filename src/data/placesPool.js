import { landmarks } from './landmarks'
import { countryCities } from './countryCities'
import { haversineDistanceKm } from '../lib/geo'

/** countryCities의 키는 landmarks에 등장하는 국가와 1:1로 겹치므로, 국가명을 그대로 재사용한다. */
export const countryNameByCode = Object.fromEntries(landmarks.map((l) => [l.countryCode, l.country]))

/**
 * F1 — "근처 관광지 날씨" 탐색용 풀. 랜드마크(관광지)와 국가별 주요 도시를 하나로 합쳐
 * 거리 기반으로 가까운 곳을 찾을 수 있게 한다.
 */
export const placesPool = [
  ...landmarks.map((l) => ({
    id: l.id,
    type: 'landmark',
    name: l.name,
    city: l.city,
    country: l.country,
    lat: l.lat,
    lon: l.lon,
    countryCode: l.countryCode,
    timezone: l.timezone,
    icon: l.icon,
  })),
  ...Object.entries(countryCities).flatMap(([countryCode, cities]) =>
    cities.map((c) => ({
      id: c.id,
      type: 'city',
      name: c.name,
      city: c.name,
      country: countryNameByCode[countryCode],
      lat: c.lat,
      lon: c.lon,
      countryCode,
      population: c.population,
      icon: '🏙️',
    })),
  ),
]

/**
 * 선택된 지점 기준 가장 가까운 관광지/도시를 거리순으로 반환한다.
 * 같은 좌표(자기 자신)는 제외.
 */
export function findNearbyPlaces(place, { limit = 5, maxKm = 1200 } = {}) {
  if (!place?.lat || !place?.lon) return []
  return placesPool
    .filter((p) => haversineDistanceKm(place.lat, place.lon, p.lat, p.lon) > 1)
    .map((p) => ({ ...p, distanceKm: haversineDistanceKm(place.lat, place.lon, p.lat, p.lon) }))
    .filter((p) => p.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
