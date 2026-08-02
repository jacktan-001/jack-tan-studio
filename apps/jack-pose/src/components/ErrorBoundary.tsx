import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-5xl mb-2">📷</div>
          <h1 className="text-xl font-semibold text-primary">出了点小问题</h1>
          <p className="text-sm text-secondary max-w-xs">
            {this.state.error?.message || '页面发生了意外错误，请尝试刷新'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition"
          >
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
