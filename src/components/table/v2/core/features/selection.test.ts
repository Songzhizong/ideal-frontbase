import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createNoopActions } from "../__tests__/test-utils"
import type { TableStateSnapshot } from "../types"
import { useSelectionFeature } from "./selection"

describe("selection feature", () => {
  it("cross-page + client 策略：selectAllMatching 会进入 exclude 模式（代表全选）", async () => {
    type Row = { id: string }
    type Filters = Record<string, never>

    const rows: Row[] = [{ id: "a" }, { id: "b" }]
    const snapshot: TableStateSnapshot<Filters> = { page: 1, size: 10, sort: [], filters: {} }

    const { result } = renderHook(() =>
      useSelectionFeature<Row, Filters>({
        feature: {
          mode: "cross-page",
          crossPage: { selectAllStrategy: "client" },
        },
        getRowId: (row) => row.id,
        getSubRows: undefined,
        rows,
        snapshot,
        total: 5,
      }),
    )

    const patched = result.current.runtime.patchActions?.(createNoopActions())
    await act(async () => {
      await patched?.selectAllMatching?.()
    })

    await waitFor(() => {
      expect(result.current.selection.crossPage?.selection.mode).toBe("exclude")
      expect(result.current.selection.crossPage?.isAllSelected).toBe(true)
      expect(result.current.selection.crossPage?.totalSelected).toBe(5)
    })
  })

  it("maxSelection 限制会阻止 selectAllMatching", async () => {
    type Row = { id: string }
    type Filters = Record<string, never>

    const rows: Row[] = [{ id: "a" }, { id: "b" }]
    const snapshot: TableStateSnapshot<Filters> = { page: 1, size: 10, sort: [], filters: {} }

    const { result } = renderHook(() =>
      useSelectionFeature<Row, Filters>({
        feature: {
          mode: "cross-page",
          crossPage: { selectAllStrategy: "client", maxSelection: 3 },
        },
        getRowId: (row) => row.id,
        getSubRows: undefined,
        rows,
        snapshot,
        total: 5,
      }),
    )

    const patched = result.current.runtime.patchActions?.(createNoopActions())
    await act(async () => {
      await patched?.selectAllMatching?.()
    })

    await waitFor(() => {
      expect(result.current.selection.crossPage?.selection.mode).toBe("include")
      expect(result.current.selection.crossPage?.isAllSelected).toBe(false)
    })
  })

  it("server 策略：fetchAllIds 会写入 include 集合", async () => {
    type Row = { id: string }
    type Filters = { q: string | null }

    const rows: Row[] = [{ id: "a" }, { id: "b" }]
    const snapshot: TableStateSnapshot<Filters> = {
      page: 1,
      size: 10,
      sort: [],
      filters: { q: null },
    }
    const fetchAllIds = vi.fn(async () => ["a", "b"])

    const { result } = renderHook(() =>
      useSelectionFeature<Row, Filters>({
        feature: {
          mode: "cross-page",
          crossPage: { selectAllStrategy: "server", fetchAllIds },
        },
        getRowId: (row) => row.id,
        getSubRows: undefined,
        rows,
        snapshot,
        total: 2,
      }),
    )

    const patched = result.current.runtime.patchActions?.(createNoopActions())
    await act(async () => {
      await patched?.selectAllMatching?.()
    })

    await waitFor(() => {
      expect(fetchAllIds).toHaveBeenCalledTimes(1)
      expect(result.current.selection.crossPage?.selection.mode).toBe("include")
      expect(result.current.selection.selectedRowIds.sort()).toEqual(["a", "b"])
    })
  })

  it("cross-page 模式：翻页不会清空选择", async () => {
    type Row = { id: string }
    type Filters = Record<string, never>

    const snapshotPage1: TableStateSnapshot<Filters> = { page: 1, size: 10, sort: [], filters: {} }
    const snapshotPage2: TableStateSnapshot<Filters> = { page: 2, size: 10, sort: [], filters: {} }

    const { result, rerender } = renderHook(
      (props: { rows: Row[]; snapshot: TableStateSnapshot<Filters> }) =>
        useSelectionFeature<Row, Filters>({
          feature: {
            mode: "cross-page",
            crossPage: { selectAllStrategy: "client" },
          },
          getRowId: (row) => row.id,
          getSubRows: undefined,
          rows: props.rows,
          snapshot: props.snapshot,
          total: 10,
        }),
      {
        initialProps: {
          rows: [{ id: "a" }, { id: "b" }],
          snapshot: snapshotPage1,
        },
      },
    )

    const patch = result.current.runtime.patchTableOptions?.({})
    const onRowSelectionChange = patch?.onRowSelectionChange
    expect(onRowSelectionChange).toBeDefined()
    act(() => {
      onRowSelectionChange?.({ a: true })
    })

    await waitFor(() => {
      expect(result.current.selection.selectedRowIds).toContain("a")
    })

    rerender({
      rows: [{ id: "c" }],
      snapshot: snapshotPage2,
    })

    await waitFor(() => {
      expect(result.current.selection.selectedRowIds).toContain("a")
      expect(result.current.selection.selectedRowsCurrentPage).toEqual([])
    })

    rerender({
      rows: [{ id: "a" }, { id: "b" }],
      snapshot: snapshotPage1,
    })

    await waitFor(() => {
      expect(result.current.selection.selectedRowsCurrentPage.map((row) => row.id)).toEqual(["a"])
    })
  })
})
