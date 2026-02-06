import type { Row } from "@tanstack/react-table"
import { createColumnHelper as createTanstackColumnHelper } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { actions } from "./actions"
import { dragHandle } from "./drag-handle"
import { expand } from "./expand"
import { select } from "./select"

export function createColumnHelper<TData>() {
	const helper = createTanstackColumnHelper<TData>()
	return {
		accessor: helper.accessor,
		display: helper.display,
		select: () => select<TData>(),
		expand: () => expand<TData>(),
		dragHandle: () => dragHandle<TData>(),
		actions: (render: (row: Row<TData>) => ReactNode) => actions<TData>(render),
	}
}
