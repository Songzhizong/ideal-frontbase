import { useEffect, useMemo, useState } from "react"
import type { PreferenceEnvelope, TablePreferenceStorage } from "../types"
import { createJsonLocalStoragePreferenceStorage } from "./preference-storage"
import { useStableCallback } from "./reference-stability"

export interface UsePreferenceOptions<TValue> {
  enabled: boolean
  storageKey: string
  schemaVersion: number
  storage?: TablePreferenceStorage<PreferenceEnvelope<TValue>> | undefined
  parse: (value: unknown) => TValue | null
}

export function usePreference<TValue>(options: UsePreferenceOptions<TValue>) {
  const { enabled, storageKey, schemaVersion, parse } = options

  const storage = useMemo(() => {
    if (!enabled) return options.storage
    if (options.storage) return options.storage
    return createJsonLocalStoragePreferenceStorage<TValue>({
      schemaVersion,
      parse,
    })
  }, [enabled, options.storage, schemaVersion, parse])

  const [preferencesReady, setPreferencesReady] = useState(
    () => !enabled || Boolean(storage?.getSync),
  )

  const [envelope, setEnvelope] = useState<PreferenceEnvelope<TValue> | null>(() => {
    if (!enabled) return null
    if (!storage?.getSync) return null
    return storage.getSync(storageKey)
  })

  useEffect(() => {
    if (!enabled) return
    if (!storage) return
    if (storage.getSync) {
      setPreferencesReady(true)
      setEnvelope(storage.getSync(storageKey))
      return
    }

    let cancelled = false
    setPreferencesReady(false)
    void storage
      .get(storageKey)
      .then((value) => {
        if (cancelled) return
        setEnvelope(value)
        setPreferencesReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setEnvelope(null)
        setPreferencesReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, storageKey, storage])

  const persist = useStableCallback(async (nextValue: TValue) => {
    if (!enabled) return
    if (!storage) return
    const nextEnvelope: PreferenceEnvelope<TValue> = {
      schemaVersion,
      updatedAt: Date.now(),
      value: nextValue,
    }
    setEnvelope(nextEnvelope)
    await storage.set(storageKey, nextEnvelope)
  })

  const remove = useStableCallback(async () => {
    if (!enabled) return
    setEnvelope(null)
    if (!storage) return
    if (storage.remove) {
      await storage.remove(storageKey)
    }
  })

  return {
    envelope,
    setEnvelope,
    preferencesReady,
    storage,
    persist,
    remove,
  }
}
