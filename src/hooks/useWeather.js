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
