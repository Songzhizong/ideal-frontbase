import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect } from "react"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { createColumnHelper } from "../../columns"
import type { DataTableInstance } from "../../core"
import { local, stateInternal, useDataTable } from "../../index"
import { DataTablePreset } from "../preset/data-table-preset"
import { createDataTableQueryPreset } from "./create-data-table-query-preset"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string
  keyword: string
}

function SearchBindingHarness(props: {
  onReady: (dt: DataTableInstance<RowData, Filters>) => void
}) {
  const helper = createColumnHelper<RowData>()
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
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: {
          q: "",
          keyword: "",
        },
      },
    }),
    getRowId: (row) => row.id,
  })

  useEffect(() => {
    props.onReady(dt)
  }, [dt, props])

  return (
    <DataTablePreset<RowData, Filters>
      dt={dt}
      query={createDataTableQueryPreset<Filters>({
        schema: {
          fields: [
            {
              id: "keyword",
              label: "关键字",
              kind: "text",
              search: {
                pickerVisible: false,
              },
              ui: {
                panel: "hidden",
              },
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
            {
              id: "q",
              label: "备用查询",
              kind: "text",
              ui: {
                panel: "hidden",
              },
              binding: {
                mode: "single",
                key: "q",
              },
            },
          ],
          search: {
            mode: "advanced",
            defaultFieldId: "keyword",
            debounceMs: 0,
            placeholder: "搜索...",
          },
        },
      })}
      pagination={false}
    />
  )
}

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  })
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe("DataTableQuerySearch field binding", () => {
  it("默认写入 search.defaultFieldId 对应字段", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null
    const user = userEvent.setup()

    render(
      <SearchBindingHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await user.type(screen.getByPlaceholderText("搜索..."), "alice{Enter}")

    await waitFor(() => {
      expect(table?.filters.state.keyword).toBe("alice")
      expect(table?.filters.state.q).toBe("")
    })
  })

  it("切换搜索字段后会写入新的字段", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null
    const user = userEvent.setup()

    render(
      <SearchBindingHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await user.click(screen.getByRole("button", { name: "筛选字段" }))
    await user.click(screen.getByText("备用查询"))
    await user.type(screen.getByRole("textbox"), "bob{Enter}")

    await waitFor(() => {
      expect(table?.filters.state.keyword).toBe("")
      expect(table?.filters.state.q).toBe("bob")
    })
  })

  it("pickerVisible=false 的默认字段不会出现在字段选择器中", async () => {
    const user = userEvent.setup()

    render(
      <SearchBindingHarness
        onReady={() => {
          // no-op
        }}
      />,
    )

    await user.click(screen.getByRole("button", { name: "筛选字段" }))

    expect(screen.queryByText("关键字")).toBeNull()
    expect(screen.getByText("备用查询")).toBeInTheDocument()
  })
})
