import type { ResolvedPayload } from "../core"

export type LiveResolvedStore = {
  getSnapshot: () => ResolvedPayload | null
  subscribe: (listener: () => void) => () => void
  setSnapshot: (snapshot: ResolvedPayload | null) => void
}

export function createLiveResolvedStore(initial: ResolvedPayload | null): LiveResolvedStore {
  let snapshot = initial
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setSnapshot(next: ResolvedPayload | null) {
      snapshot = next
      for (const listener of listeners) {
        listener()
      }
    },
  }
}
