import { useQuery } from '@tanstack/react-query'
import { fetchForecastBatch, fetchForecastSingle } from '../lib/openMeteo'
import { landmarks } from '../data/landmarks'

const TEN_MIN = 10 * 60 * 1000
const RETRY_DELAYS = [1000, 2000, 4000]

// F9.3 — 5xx/타임아웃만 재시도, 4xx는 재시도하지 않는다.
function shouldRetry(failureCount, error) {
  if (error?.status && error.status >= 400 && error.status < 500) return false
  return failureCount < 3
}

function retryDelay(attempt) {
  return RETRY_DELAYS[attempt] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]
}

/** 12개 랜드마크 전체 날씨를 1회 배치 호출로 조회 — 핀 배지와 상세 패널이 이 캐시를 공유 */
export function useAllLandmarksWeather() {
  return useQuery({
    queryKey: ['weather', 'landmarks-batch'],
    queryFn: () => fetchForecastBatch(landmarks),
    staleTime: TEN_MIN,
    refetchInterval: TEN_MIN,
    refetchIntervalInBackground: false,
    retry: shouldRetry,
    retryDelay,
  })
}

/** 검색으로 찾은 임의 좌표(랜드마크 목록 밖)의 날씨 조회 */
export function useSingleLocationWeather(lat, lon, enabled = true) {
  return useQuery({
    queryKey: ['weather', 'single', lat, lon],
    queryFn: () => fetchForecastSingle(lat, lon),
    enabled: enabled && lat != null && lon != null,
    staleTime: TEN_MIN,
    retry: shouldRetry,
    retryDelay,
  })
}

/** F1 — 선택 지점 근처 관광지/도시 후보들의 날씨를 1회 배치 호출로 조회 */
export function useNearbyWeather(candidates) {
  const ids = (candidates ?? []).map((c) => c.id).join(',')
  return useQuery({
    queryKey: ['weather', 'nearby', ids],
    queryFn: () => fetchForecastBatch(candidates),
    enabled: (candidates?.length ?? 0) > 0,
    staleTime: TEN_MIN,
    retry: shouldRetry,
    retryDelay,
  })
}

/** F2 — 국가 맵 모달에 표시할 인구 상위 도시들의 날씨를 배치 조회 */
export function useCountryCitiesWeather(countryCode, cities) {
  return useQuery({
    queryKey: ['weather', 'country-cities', countryCode],
    queryFn: () => fetchForecastBatch(cities),
    enabled: !!countryCode && (cities?.length ?? 0) > 0,
    staleTime: TEN_MIN,
    retry: shouldRetry,
    retryDelay,
  })
}
