import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchGeocoding } from '../lib/openMeteo'

const DAY = 24 * 60 * 60 * 1000

/** F5.2 — 300ms 디바운스 후 지오코딩 검색 */
export function useGeocodingSearch(query) {
  const [debounced, setDebounced] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const trimmed = debounced.trim()

  return useQuery({
    queryKey: ['geocoding', trimmed],
    queryFn: () => searchGeocoding(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: DAY,
    retry: (failureCount, error) => {
      if (error?.status && error.status >= 400 && error.status < 500) return false
      return failureCount < 2
    },
  })
}
