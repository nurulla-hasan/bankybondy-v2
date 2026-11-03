import * as React from "react"

const MOBILE_BREAKPOINT = 768

export const useIsMobile = (): boolean => {
  const getSnapshot = React.useCallback(() => {
    if (typeof window === "undefined") return false

    return window.innerWidth < MOBILE_BREAKPOINT
  }, [])

  return React.useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", onStoreChange)

      return () => mql.removeEventListener("change", onStoreChange)
    },
    getSnapshot,
    // Server snapshot must be stable so SSR and the first client (hydration)
    // render agree. Reading window here would cause a mobile/desktop mismatch.
    () => false,
  )
}