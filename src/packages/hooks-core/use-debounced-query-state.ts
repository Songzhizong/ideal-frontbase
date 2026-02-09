import { type Options, parseAsString, useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

export function useDebouncedQueryState(
  key: string,
  delay = 500,
  options?: Options & { onQueryChange?: (value: string | null) => void },
) {
  // 1. nuqs URL state
  const [query, setQuery] = useQueryState(
    key,
    parseAsString.withDefault("").withOptions({
      shallow: false, // Usually search needs to trigger server requests
      ...options,
    }),
  )

  // 2. Local React state (for smooth input UX)
  const [value, setValue] = useState(query ?? "")

  // 3. Debounced callback: delayed URL update
  const debouncedSetQuery = useDebouncedCallback((newValue: string) => {
    const nextValue = newValue || null
    // If empty string, store as null to clear URL parameter
    void setQuery(nextValue).then(() => {
      options?.onQueryChange?.(nextValue)
    })
  }, delay)

  // 4. Handle input changes
  const onValueChange = (newValue: string) => {
    setValue(newValue) // Immediate UI update
    debouncedSetQuery(newValue) // Delayed URL update
  }

  // 5. Critical sync: if URL changes (e.g., user clicks browser back), local state should also change
  useEffect(() => {
    setValue(query ?? "")
  }, [query])

  // 6. Manual apply (for search button or Enter key)
  const applyValue = () => {
    debouncedSetQuery.cancel()
    const nextValue = value || null
    void setQuery(nextValue).then(() => {
      options?.onQueryChange?.(nextValue)
    })
  }

  // 7. Reset value
  const resetValue = () => {
    debouncedSetQuery.cancel()
    setValue("")
    void setQuery(null).then(() => {
      options?.onQueryChange?.(null)
    })
  }

  return {
    value,
    onValueChange,
    applyValue,
    resetValue,
    urlValue: query ?? "",
  } as const
}
