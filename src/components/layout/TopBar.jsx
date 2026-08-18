import SearchBar from '../search/SearchBar'
import { useAppStore } from '../../store/useAppStore'

export default function TopBar() {
  const unit = useAppStore((s) => s.unit)
  const setUnit = useAppStore((s) => s.setUnit)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center gap-4 p-4">
      <div className="pointer-events-auto flex shrink-0 items-center gap-2 text-white">
        <span className="text-xl">🌍</span>
        <span className="hidden font-semibold tracking-tight sm:inline">Terra Weather</span>
      </div>

      <div className="pointer-events-auto flex flex-1 justify-center">
        <SearchBar />
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-black/40 p-1 text-xs text-white backdrop-blur-md">
        <button
          onClick={() => setUnit('c')}
          className={`rounded-full px-2.5 py-1 transition ${unit === 'c' ? 'bg-white/20' : 'text-white/50 hover:text-white/80'}`}
        >
          °C
        </button>
        <button
          onClick={() => setUnit('f')}
          className={`rounded-full px-2.5 py-1 transition ${unit === 'f' ? 'bg-white/20' : 'text-white/50 hover:text-white/80'}`}
        >
          °F
        </button>
      </div>
    </header>
  )
}
