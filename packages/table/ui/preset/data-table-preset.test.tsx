import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createColumnHelper } from "../../columns"
import { local, stateInternal, useDataTable } from "../../index"
import { createDataTableQueryPreset } from "../query/create-data-table-query-preset"
import type { DataTablePresetQueryProps } from "../query/types"
import type { DataTablePaginationProps } from "../table/pagination"
import type { DataTableTableProps } from "../table/table"
import { DataTablePreset } from "./data-table-preset"

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
        query={createDataTableQueryPreset<Filters>({
          schema: {
            fields: [
              {
                id: "keyword",
                label: "关键字",
                kind: "text",
                binding: {
                  mode: "single",
                  key: "keyword",
                },
              },
            ],
            search: {
              debounceMs: 0,
            },
          },
          slots: {
            actionsRight: <button type="button">刷新</button>,
          },
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
        query={createDataTableQueryPreset<Filters>({
          schema: {
            fields: [
              {
                id: "keyword",
                label: "关键字",
                kind: "text",
                binding: {
                  mode: "single",
                  key: "keyword",
                },
              },
            ],
            search: false,
          },
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
