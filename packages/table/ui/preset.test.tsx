import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createColumnHelper } from "../columns"
import { local, stateInternal, useDataTable } from "../index"
import type { DataTablePaginationProps } from "./pagination"
import { createCrudQueryPreset } from "./query-preset"
import type { DataTablePresetQueryProps } from "./preset"
import { DataTablePreset } from "./preset"
import type { DataTableTableProps } from "./table"

type RowData = {
  id: string
  name: string
}

type Filters = {
  keyword: string
}

const helper = createColumnHelper<RowData>()

function PresetHarness(props: {
  rows: RowData[]
  query: DataTablePresetQueryProps<Filters>
  table?: Pick<DataTableTableProps<RowData>, "renderEmpty">
  pagination?: DataTablePaginationProps | false
}) {
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "Name",
        cell: (ctx) => ctx.getValue(),
      }),
    ],
    dataSource: local<RowData, Filters>({
      rows: props.rows,
      total: props.rows.length,
    }),
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: {
          keyword: "",
        },
      },
      searchKey: "keyword",
    }),
    getRowId: (row) => row.id,
  })

  return (
    <DataTablePreset<RowData, Filters>
      dt={dt}
      query={props.query}
      {...(props.table ? { table: props.table } : {})}
      {...(props.pagination !== undefined ? { pagination: props.pagination } : {})}
    />
  )
}

describe("DataTablePreset", () => {
  it("标准模板会渲染搜索、操作区与分页", () => {
    render(
      <PresetHarness
        rows={[{ id: "u-1", name: "Alice" }]}
        query={createCrudQueryPreset<Filters>({
          search: {
            filterKey: "keyword",
            debounceMs: 0,
          },
          actions: <button type="button">刷新</button>,
        })}
      />,
    )

    expect(screen.getByPlaceholderText("搜索...")).toBeTruthy()
    expect(screen.getByRole("button", { name: "刷新" })).toBeTruthy()
    expect(screen.getByText("条/页")).toBeTruthy()
  })

  it("search=false 且 pagination=false 时不渲染搜索与分页，并支持自定义空态", () => {
    render(
      <PresetHarness
        rows={[]}
        query={createCrudQueryPreset<Filters>({
          search: false,
        })}
        table={{
          renderEmpty: () => <div>EMPTY SLOT</div>,
        }}
        pagination={false}
      />,
    )

    expect(screen.queryByPlaceholderText("搜索...")).toBeNull()
    expect(screen.queryByText("条/页")).toBeNull()
    expect(screen.getByText("EMPTY SLOT")).toBeTruthy()
  })
})
