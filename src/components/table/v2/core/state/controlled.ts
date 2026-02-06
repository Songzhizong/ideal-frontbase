import { useCallback, useEffect, useMemo, useRef } from "react"
import type {
	ControlledStateOptions,
	TableStateAdapter,
	TableStateChangeReason,
	TableStateSnapshot,
} from "../types"

function applyFilterBehavior<TFilterSchema>(
	_prev: TableStateSnapshot<TFilterSchema>,
	next: TableStateSnapshot<TFilterSchema>,
	reason: TableStateChangeReason,
	options?: ControlledStateOptions<TFilterSchema>["behavior"],
): TableStateSnapshot<TFilterSchema> {
	if (reason !== "filters") return next
	const shouldReset = options?.resetPageOnFilterChange ?? true
	if (!shouldReset) return next
	return { ...next, page: 1 }
}

export function stateControlled<TFilterSchema>(
	options: ControlledStateOptions<TFilterSchema>,
): TableStateAdapter<TFilterSchema> {
	const listenersRef = useRef(new Set<() => void>())
	const snapshotRef = useRef<TableStateSnapshot<TFilterSchema>>(options.value)
	const behaviorRef = useRef(options.behavior)
	const onChangeRef = useRef(options.onChange)

	behaviorRef.current = options.behavior
	onChangeRef.current = options.onChange

	useEffect(() => {
		snapshotRef.current = options.value
		for (const listener of listenersRef.current) {
			listener()
		}
	}, [options.value])

	const getSnapshot = useCallback(() => snapshotRef.current, [])

	const setSnapshot = useCallback(
		(next: TableStateSnapshot<TFilterSchema>, reason: TableStateChangeReason) => {
			const adjusted = applyFilterBehavior(snapshotRef.current, next, reason, behaviorRef.current)
			onChangeRef.current(adjusted)
		},
		[],
	)

	const subscribe = useCallback((listener: () => void) => {
		listenersRef.current.add(listener)
		return () => {
			listenersRef.current.delete(listener)
		}
	}, [])

	return useMemo(
		() => ({
			getSnapshot,
			setSnapshot,
			subscribe,
		}),
		[getSnapshot, setSnapshot, subscribe],
	)
}
