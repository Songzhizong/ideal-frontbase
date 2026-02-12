import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import { createColumnHelper } from "../columns"
import type { DataTableInstance } from "../core/types"
import { local, stateInternal, useDataTable } from "../index"
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
    searchKey: "keyword",
  })

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

function AdvancedSearchHarness(props: {
  onReady: (dt: DataTableInstance<RowData, Filters>) => void
}) {
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
      <DataTableSearch<Filters> mode="advanced" />
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

  it("缺少 filterKey 与 state.searchKey 时会回退到 q，并在开发环境告警", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    let table: DataTableInstance<RowData, Filters> | null = null

    render(
      <AdvancedSearchHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "fallback" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => {
      expect(table).not.toBeNull()
      expect(table?.filters.state.q).toBe("fallback")
    })

    if (import.meta.env.DEV) {
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Missing `filterKey` and `state.searchKey`"),
      )
    } else {
      expect(warnSpy).not.toHaveBeenCalled()
    }

    warnSpy.mockRestore()
  })
})

describe("DataTableSearch advanced mode submit behavior", () => {
  it("清空输入后按回车会清空已提交的搜索条件", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null

    render(
      <AdvancedSearchHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "alice" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => {
      expect(table).not.toBeNull()
      expect(table?.filters.state.q).toBe("alice")
    })

    fireEvent.change(input, { target: { value: "" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => {
      expect(table?.filters.state.q).toBe("")
    })
  })

  it("输入法组合态按回车不会触发提交", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null

    render(
      <AdvancedSearchHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "abc" } })

    fireEvent.keyDown(input, { key: "Enter", keyCode: 229, isComposing: true })
    await waitFor(() => {
      expect(table).not.toBeNull()
      expect(table?.filters.state.q).toBe("")
    })

    fireEvent.keyDown(input, { key: "Enter" })

    await waitFor(() => {
      expect(table?.filters.state.q).toBe("abc")
    })
  })
})
