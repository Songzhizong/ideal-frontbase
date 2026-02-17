import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { createColumnHelper } from "../../columns"
import { local, stateInternal, useDataTable } from "../../index"
import { DataTablePreset } from "../preset/data-table-preset"
import { createDataTableQueryPreset } from "./create-data-table-query-preset"

type RowData = {
  id: string
  name: string
}

type Filters = {
  keyword: string
  status: string | null
}

function QueryLayoutHarness(props: { withSecondary: boolean }) {
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
          keyword: "",
          status: null,
        },
      },
    }),
    getRowId: (row) => row.id,
  })

  const fields = props.withSecondary
    ? [
        {
          id: "keyword",
          label: "关键字",
          kind: "text" as const,
          binding: {
            mode: "single" as const,
            key: "keyword" as const,
          },
        },
        {
          id: "status",
          label: "状态",
          kind: "select" as const,
          ui: {
            panel: "secondary" as const,
          },
          binding: {
            mode: "single" as const,
            key: "status" as const,
          },
          options: [{ label: "激活", value: "active" }],
        },
      ]
    : [
        {
          id: "keyword",
          label: "关键字",
          kind: "text" as const,
          binding: {
            mode: "single" as const,
            key: "keyword" as const,
          },
        },
      ]

  return (
    <DataTablePreset<RowData, Filters>
      dt={dt}
      query={createDataTableQueryPreset<Filters>({
        schema: {
          fields,
          search: false,
        },
      })}
      pagination={false}
    />
  )
}

describe("DataTableQueryPanel layout", () => {
  it("有隐藏条件时展示展开按钮并在展开后显示 secondary 条件", async () => {
    const user = userEvent.setup()
    render(<QueryLayoutHarness withSecondary />)

    expect(screen.getByRole("button", { name: "展开" })).toBeInTheDocument()
    expect(screen.queryByText("状态")).toBeNull()

    await user.click(screen.getByRole("button", { name: "展开" }))

    expect(screen.getByText("状态")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "收起" })).toBeInTheDocument()
  })

  it("没有隐藏条件时不展示展开按钮", () => {
    render(<QueryLayoutHarness withSecondary={false} />)

    expect(screen.queryByRole("button", { name: "展开" })).toBeNull()
  })
})
