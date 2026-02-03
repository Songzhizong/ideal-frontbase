import { useLayoutEffect, useRef, useState } from "react"

/**
 * Hook to measure the size of an element using ResizeObserver.
 * Useful for calculating sticky offsets or dynamic layouts.
 */
export function useElementSize<T extends HTMLElement>() {
	const ref = useRef<T>(null)
	const [size, setSize] = useState({ width: 0, height: 0 })

	useLayoutEffect(() => {
		if (ref.current) {
			const updateSize = () => {
				if (ref.current) {
					const rect = ref.current.getBoundingClientRect()
					setSize({ width: rect.width, height: rect.height })
				}
			}

			// Measure immediately
			updateSize()

			const resizeObserver = new ResizeObserver(updateSize)
			resizeObserver.observe(ref.current)

			return () => resizeObserver.disconnect()
		}
	}, [])

	return [ref, size] as const
}
