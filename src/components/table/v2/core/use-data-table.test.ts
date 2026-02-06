import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createColumnHelper } from "../columns"
import { local } from "./data-source/local"
import { stateInternal } from "./state/internal"
import { useDataTable } from "./use-data-table"

describe("useDataTable", () => {
  it("actions() 列会通过 meta.pinned 自动固定到右侧", () => {
    type Row = { id: string }
    type Filters = { q: string | null }

    const { result } = renderHook(() => {
      const state = stateInternal<Filters>({
        initial: { page: 1, size: 10, sort: [], filters: { q: null } },
      })
      const dataSource = local<Row, Filters>({
        rows: [{ id: "a" }],
      })
      const helper = createColumnHelper<Row>()
      const columns = [
        helper.accessor("id", {
          header: "ID",
          cell: (ctx) => ctx.getValue(),
        }),
        helper.actions((row) => row.original.id),
      ]

      return useDataTable<Row, Filters>({
        columns,
        dataSource,
        state,
        getRowId: (row) => row.id,
      })
    })

    expect(result.current.table.getState().columnPinning.right).toContain("__actions__")
  })
})
