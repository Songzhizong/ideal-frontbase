import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
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
  keyword: string
  status: string | null
  blocked: "" | "true" | "false"
}

function QueryClearHarness(props: { onReady: (dt: DataTableInstance<RowData, Filters>) => void }) {
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
          keyword: "alice",
          status: "active",
          blocked: "true",
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
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
            {
              id: "status",
              label: "状态",
              kind: "select",
              binding: {
                mode: "single",
                key: "status",
              },
              options: [{ label: "激活", value: "active" }],
            },
            {
              id: "blocked",
              label: "锁定状态",
              kind: "select",
              binding: {
                mode: "single",
                key: "blocked",
              },
              options: [
                { label: "全部", value: "" },
                { label: "锁定", value: "true" },
                { label: "未锁定", value: "false" },
              ],
            },
          ],
          search: false,
        },
      })}
      pagination={false}
    />
  )
}

describe("DataTableQueryPanel clear behavior", () => {
  it("支持单项清除和清除全部", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null
    const user = userEvent.setup()

    render(
      <QueryClearHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await waitFor(() => expect(table).not.toBeNull())
    expect(screen.getAllByRole("button", { name: "移除筛选 关键字" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: "移除筛选 状态" }).length).toBeGreaterThan(0)

    const removeKeywordButtons = screen.getAllByRole("button", { name: "移除筛选 关键字" })
    const removeKeywordButton = removeKeywordButtons.at(0)
    if (!removeKeywordButton) throw new Error("未找到关键字清除按钮")
    await user.click(removeKeywordButton)

    await waitFor(() => {
      expect(table?.filters.state.keyword).toBe("")
      expect(table?.filters.state.status).toBe("active")
      expect(table?.filters.state.blocked).toBe("true")
    })

    await user.click(screen.getByRole("button", { name: "清除全部" }))

    await waitFor(() => {
      expect(table?.filters.state.keyword).toBe("")
      expect(table?.filters.state.status).toBeNull()
      expect(table?.filters.state.blocked).toBe("")
    })
  })
})
