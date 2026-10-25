import { useCallback, useState, type ComponentType } from 'react'

/**
 * A code-split component without React.lazy: `load()` fetches the chunk (dedupes repeat calls) and
 * the component renders as soon as it's in memory. React.lazy + Suspense would add React's ~300 ms
 * Suspense reveal throttle to the first open, even with the chunk already prefetched.
 */
export function useLazyComponent<P>(loader: () => Promise<{ default: ComponentType<P> }>) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null)
  const load = useCallback(() => {
    void loader().then((m) => setComponent(() => m.default))
  }, [loader])
  return { Component, load }
}
