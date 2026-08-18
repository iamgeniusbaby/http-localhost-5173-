import { useMemo, useRef, useState } from 'react'
import { landmarks } from '../../data/landmarks'
import { useGeocodingSearch } from '../../hooks/useGeocodingSearch'
import { useAppStore } from '../../store/useAppStore'

function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const chars = [...countryCode.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65))
  return String.fromCodePoint(...chars)
}

function matchLandmarks(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return landmarks
    .filter(
      (l) =>
        l.name.ko.includes(q) ||
        l.name.en.toLowerCase().includes(q) ||
        l.city.ko.includes(q) ||
        l.city.en.toLowerCase().includes(q),
    )
    .slice(0, 5)
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const selectPlace = useAppStore((s) => s.selectPlace)

  const trimmed = query.trim()
  const landmarkMatches = useMemo(() => matchLandmarks(trimmed), [trimmed])
  const { data: geoResults, isLoading, isFetching, isError, refetch } = useGeocodingSearch(query)

  // F5.4 — 내부 랜드마크 우선 매칭, 지오코딩 결과 중 중복 도시는 제외
  const geoOptions = (geoResults ?? [])
    .filter((r) => !landmarkMatches.some((l) => l.city.ko === r.name || l.city.en === r.name))
    .slice(0, 6)

  const options = [
    ...landmarkMatches.map((l) => ({ kind: 'landmark', data: l })),
    ...geoOptions.map((g) => ({ kind: 'geo', data: g })),
  ]

  const showNoResults =
    trimmed.length >= 2 && !isLoading && !isFetching && !isError && options.length === 0

  function toPlace(option) {
    if (option.kind === 'landmark') {
      return { ...option.data, isLandmark: true }
    }
    const g = option.data
    return {
      id: `geo-${g.id}`,
      name: { ko: g.name, en: g.name },
      city: { ko: g.admin1 ? `${g.name}, ${g.admin1}` : g.name, en: g.name },
      country: { ko: g.country, en: g.country },
      lat: g.latitude,
      lon: g.longitude,
      timezone: g.timezone,
      countryCode: g.country_code,
      icon: countryFlag(g.country_code),
      isLandmark: false,
    }
  }

  function commit(option) {
    if (!option) return
    selectPlace(toPlace(option))
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
  }

  function onKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit(options[activeIndex] ?? options[0])
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  return (
    <div role="combobox" aria-expanded={open} aria-owns="search-listbox" aria-haspopup="listbox" className="relative w-full max-w-sm">
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="도시나 랜드마크를 검색하세요"
        aria-autocomplete="list"
        aria-controls="search-listbox"
        className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white placeholder-white/40 backdrop-blur-md outline-none focus:border-white/40"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && trimmed.length > 0 && (
        <ul
          id="search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-1.5 text-sm text-white shadow-2xl backdrop-blur-xl"
        >
          {options.map((option, i) => {
            const key = option.kind === 'landmark' ? option.data.id : `geo-${option.data.id}`
            const label =
              option.kind === 'landmark'
                ? `${option.data.icon} ${option.data.name.ko}`
                : `${countryFlag(option.data.country_code)} ${option.data.name}${option.data.admin1 ? `, ${option.data.admin1}` : ''}`
            const sub =
              option.kind === 'landmark'
                ? `${option.data.city.ko} · ${option.data.country.ko}`
                : `${option.data.country ?? ''}${option.data.population ? ` · 인구 ${option.data.population.toLocaleString()}` : ''}`
            return (
              <li
                key={key}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  commit(option)
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`cursor-pointer rounded-lg px-3 py-2 ${i === activeIndex ? 'bg-white/15' : 'hover:bg-white/10'}`}
              >
                <div className="font-medium">{label}</div>
                <div className="text-xs text-white/50">{sub}</div>
              </li>
            )
          })}

          {isError && (
            <li className="px-3 py-2">
              <p className="text-red-300">검색 중 문제가 발생했어요</p>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  refetch()
                }}
                className="mt-1 rounded-md bg-red-400/20 px-2.5 py-1 text-xs text-red-100 hover:bg-red-400/30"
              >
                재시도
              </button>
            </li>
          )}

          {showNoResults && (
            <li className="px-3 py-3 text-white/70">
              <p>'{trimmed}'에 대한 결과가 없습니다. 철자를 확인하거나 영문으로 검색해 보세요.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {landmarks.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      commit({ kind: 'landmark', data: l })
                    }}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20"
                  >
                    {l.icon} {l.name.ko}
                  </button>
                ))}
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
