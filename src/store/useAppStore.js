import { create } from 'zustand'

/**
 * selectedPlace shape: { id, name{ko,en}, city{ko,en}, country{ko,en}, lat, lon,
 *   timezone, icon, isLandmark }
 * 랜드마크 선택과 검색으로 찾은 임의 도시 선택을 동일한 구조로 다룬다.
 */
export const useAppStore = create((set) => ({
  view: 'space', // 'space' | 'focused'
  selectedPlace: null,
  hoveredLandmarkId: null,
  unit: 'c', // 'c' | 'f'
  searchQuery: '',

  selectPlace: (place) => set({ selectedPlace: place, view: 'focused' }),
  clearSelection: () => set({ selectedPlace: null, view: 'space' }),
  setHovered: (id) => set({ hoveredLandmarkId: id }),
  setUnit: (unit) => set({ unit }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
