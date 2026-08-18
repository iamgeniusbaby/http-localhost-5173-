import { Component } from 'react'

/** F9.2 — 최상위 Error Boundary로 화이트스크린 방지 (E-CRASH) */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Terra Weather crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-black text-white">
          <p className="text-lg font-medium">예기치 못한 문제가 발생했어요</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-white/15 px-4 py-2 text-sm hover:bg-white/25"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
