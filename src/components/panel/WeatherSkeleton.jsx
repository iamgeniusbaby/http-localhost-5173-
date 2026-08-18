export default function WeatherSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-live="polite" aria-label="날씨 정보 불러오는 중">
      <div className="h-6 w-2/3 rounded bg-white/10" />
      <div className="h-16 w-1/2 rounded bg-white/10" />
      <div className="h-4 w-3/4 rounded bg-white/10" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-white/10" />
        ))}
      </div>
    </div>
  )
}
