import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createDeferred, createNoopActions } from "../__tests__/test-utils"
import { useTreeFeature } from "./tree"

describe("tree feature", () => {
	it("defaultExpandedDepth=1 会展开有子节点的根节点，并注入 meta/enableSubRowSelection", async () => {
		type RowData = { id: string; children?: RowData[] }

		const rows: RowData[] = [{ id: "a", children: [{ id: "a1" }] }, { id: "b" }]

		const { result } = renderHook(() =>
			useTreeFeature<RowData, Record<string, never>>({
				feature: {
					getSubRows: (row) => row.children,
					defaultExpandedDepth: 1,
					indentSize: 32,
					selectionBehavior: "cascade",
					allowNesting: true,
				},
				getRowId: (row) => row.id,
				rows,
			}),
		)

		await waitFor(() => {
			expect(result.current.tree.enabled).toBe(true)
			expect(result.current.tree.expandedRowIds).toContain("a")
		})

		const patch = result.current.runtime.patchTableOptions?.({})
		expect(patch?.enableSubRowSelection).toBe(true)
		expect(patch?.meta).toMatchObject({
			dtTreeIndentSize: 32,
			dtTreeAllowNesting: true,
		})
	})

	it("loadChildren 会在 expandRow 时进入 loadingRowIds，并在完成后写入 children", async () => {
		type RowData = { id: string }

		const rows: RowData[] = [{ id: "a" }]
		const deferred = createDeferred<RowData[]>()
		const loadChildren = vi.fn(async () => deferred.promise)

		const { result } = renderHook(() =>
			useTreeFeature<RowData, Record<string, never>>({
				feature: {
					loadChildren,
				},
				getRowId: (row) => row.id,
				rows,
			}),
		)

		const patched = result.current.runtime.patchActions?.(createNoopActions())
		act(() => {
			patched?.expandRow?.("a")
		})

		await waitFor(() => {
			expect(result.current.tree.loadingRowIds).toContain("a")
		})

		act(() => {
			deferred.resolve([{ id: "a1" }])
		})

		await waitFor(() => {
			expect(result.current.tree.loadingRowIds).not.toContain("a")
		})

		expect(loadChildren).toHaveBeenCalledTimes(1)
		const getSubRows = result.current.getSubRows
		const root = rows[0]
		if (!root) {
			throw new Error("rows 不能为空")
		}
		expect(getSubRows?.(root)).toEqual([{ id: "a1" }])
	})
})
