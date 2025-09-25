import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

// Lazy load heavy components
const Credits = lazy(() => import('./credits'))
const Dashboard = lazy(() => import('../routes/dashboard'))

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4 text-center max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      <span className="ml-2 text-[var(--color-neutral-600)]">Loading...</span>
    </div>
  )
}

// Higher-order component for lazy loading with error boundaries
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: T) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={fallback || <LoadingSpinner />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

export { Credits, Dashboard, ErrorFallback, LoadingSpinner }