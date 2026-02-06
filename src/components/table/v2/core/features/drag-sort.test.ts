import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useDragSortFeature } from "./drag-sort"

function getMetaValue<T>(patch: { meta?: unknown } | undefined, key: string): T | null {
	if (!patch || typeof patch.meta !== "object" || patch.meta === null) return null
	const record = patch.meta as Record<string, unknown>
	return (record[key] as T) ?? null
}

describe("dragSort feature", () => {
	it("position=below 会在同级完成重排并提供 reorderedRows", async () => {
		type RowData = { id: string }
		type ReorderArgs = {
			activeId: string
			overId: string
			activeIndex: number
			overIndex: number
			reorderedRows?: RowData[]
			dropPosition?: "above" | "below" | "inside"
			targetIndex?: number
			targetParentId?: string | null
		}

		const onReorder = vi.fn(async (_args: ReorderArgs) => {})
		const rows: RowData[] = [{ id: "a" }, { id: "b" }, { id: "c" }]

		const { result } = renderHook(() =>
			useDragSortFeature<RowData, Record<string, never>>({
				feature: { onReorder },
				getRowId: (row) => row.id,
				getSubRows: undefined,
				rows,
			}),
		)

		const patch = result.current.runtime.patchTableOptions?.({})
		const onDragEnd = getMetaValue<
			(args: {
				activeId: string
				overId: string | null
				position?: "above" | "below" | "inside"
			}) => Promise<void>
		>(patch, "dtDragSortOnDragEnd")

		expect(onDragEnd).not.toBeNull()
		await act(async () => {
			await onDragEnd?.({ activeId: "a", overId: "b", position: "below" })
		})

		expect(onReorder).toHaveBeenCalledTimes(1)
		const firstCall = onReorder.mock.calls[0]
		if (!firstCall) {
			throw new Error("onReorder 未被调用")
		}
		const args = firstCall[0]
		if (!args) {
			throw new Error("onReorder 未收到参数")
		}

		expect(args.activeId).toBe("a")
		expect(args.overId).toBe("b")
		expect(args.activeIndex).toBe(0)
		expect(args.overIndex).toBe(1)
		expect(args.dropPosition).toBe("below")
		expect(args.targetParentId).toBeNull()
		expect(args.targetIndex).toBe(1)
		expect(args.reorderedRows?.map((row) => row.id)).toEqual(["b", "a", "c"])
	})

	it("allowNesting + inside 会产出 targetParentId/targetIndex", async () => {
		type RowData = { id: string; children?: RowData[] }
		type ReorderArgs = {
			dropPosition?: "above" | "below" | "inside"
			targetParentId?: string | null
			targetIndex?: number
			reorderedRows?: RowData[]
		}

		const onReorder = vi.fn(async (_args: ReorderArgs) => {})
		const rows: RowData[] = [{ id: "a", children: [{ id: "b" }] }, { id: "c" }]

		const { result } = renderHook(() =>
			useDragSortFeature<RowData, Record<string, never>>({
				feature: { onReorder, allowNesting: true },
				getRowId: (row) => row.id,
				getSubRows: (row) => row.children,
				rows,
			}),
		)

		const patch = result.current.runtime.patchTableOptions?.({})
		const onDragEnd = getMetaValue<
			(args: {
				activeId: string
				overId: string | null
				position?: "above" | "below" | "inside"
			}) => Promise<void>
		>(patch, "dtDragSortOnDragEnd")

		await act(async () => {
			await onDragEnd?.({ activeId: "c", overId: "a", position: "inside" })
		})

		expect(onReorder).toHaveBeenCalledTimes(1)
		const firstCall = onReorder.mock.calls[0]
		if (!firstCall) {
			throw new Error("onReorder 未被调用")
		}
		const args = firstCall[0]
		if (!args) {
			throw new Error("onReorder 未收到参数")
		}

		expect(args.dropPosition).toBe("inside")
		expect(args.targetParentId).toBe("a")
		expect(args.targetIndex).toBe(1)
		expect(args.reorderedRows).toBeUndefined()
	})

	it("会阻止把父节点拖入自己的子节点", async () => {
		type RowData = { id: string; children?: RowData[] }
		type ReorderArgs = {
			dropPosition?: "above" | "below" | "inside"
			targetParentId?: string | null
			targetIndex?: number
			reorderedRows?: RowData[]
		}

		const onReorder = vi.fn(async (_args: ReorderArgs) => {})
		const rows: RowData[] = [{ id: "a", children: [{ id: "b" }] }]

		const { result } = renderHook(() =>
			useDragSortFeature<RowData, Record<string, never>>({
				feature: { onReorder, allowNesting: true },
				getRowId: (row) => row.id,
				getSubRows: (row) => row.children,
				rows,
			}),
		)

		const patch = result.current.runtime.patchTableOptions?.({})
		const onDragEnd = getMetaValue<
			(args: {
				activeId: string
				overId: string | null
				position?: "above" | "below" | "inside"
			}) => Promise<void>
		>(patch, "dtDragSortOnDragEnd")

		await act(async () => {
			await onDragEnd?.({ activeId: "a", overId: "b", position: "inside" })
		})

		expect(onReorder).toHaveBeenCalledTimes(0)
	})
})
