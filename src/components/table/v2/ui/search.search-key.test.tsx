import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/components/table/v2"
import { createColumnHelper } from "../columns"
import type { DataTableInstance } from "../core/types"
import { DataTableRoot } from "./root"
import { DataTableSearch } from "./search"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string
  keyword: string
}

function SearchKeyHarness(props: { onReady: (dt: DataTableInstance<RowData, Filters>) => void }) {
  const helper = createColumnHelper<RowData>()
  const state = stateInternal<Filters>({
    initial: {
      page: 1,
      size: 10,
      sort: [],
      filters: {
        q: "",
        keyword: "",
      },
    },
  })
  state.searchKey = "keyword"

  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "Name",
        cell: (ctx) => ctx.getValue(),
      }),
    ],
    dataSource: local<RowData, Filters>({
      rows: [{ id: "1", name: "Alice" }],
    }),
    state,
    getRowId: (row) => row.id,
  })

  useEffect(() => {
    props.onReady(dt)
  }, [dt, props])

  return (
    <DataTableRoot dt={dt}>
      <DataTableSearch<Filters> debounceMs={0} />
    </DataTableRoot>
  )
}

describe("DataTableSearch searchKey alignment", () => {
  it("未显式传 filterKey 时会优先使用 state.searchKey", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null

    render(
      <SearchKeyHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    const input = screen.getByPlaceholderText("搜索...")
    fireEvent.change(input, { target: { value: "alice" } })

    await waitFor(() => {
      expect(table).not.toBeNull()
      expect(table?.filters.state.keyword).toBe("alice")
      expect(table?.filters.state.q).toBe("")
    })
  })
})
