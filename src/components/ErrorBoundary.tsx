import { Component, type ReactNode } from 'react'

// Isolates render failures (e.g. a post with unexpected metadata) to a single
// slide instead of white-screening the whole feed.
export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(err: unknown) {
    console.error('slide render error', err)
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback ?? <div className="state">This post couldn't be displayed.</div>
    }
    return this.props.children
  }
}
