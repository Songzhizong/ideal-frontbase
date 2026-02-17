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
  startTimeMs: number | null
  endTimeMs: number | null
}

function CompositeChipHarness(props: {
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
          startTimeMs: new Date("2026-01-01T00:00:00.000Z").getTime(),
          endTimeMs: new Date("2026-01-07T00:00:00.000Z").getTime(),
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
              id: "timeRange",
              label: "时间范围",
              kind: "custom",
              binding: {
                mode: "composite",
                keys: ["startTimeMs", "endTimeMs"],
                getValue: (filters) => ({
                  from: filters.startTimeMs != null ? new Date(filters.startTimeMs) : undefined,
                  to: filters.endTimeMs != null ? new Date(filters.endTimeMs) : undefined,
                }),
                setValue: () => ({
                  startTimeMs: null,
                  endTimeMs: null,
                }),
                clearValue: () => ({
                  startTimeMs: null,
                  endTimeMs: null,
                }),
                isEmpty: (value) => {
                  if (typeof value !== "object" || value === null) return true
                  const from = "from" in value ? value.from : undefined
                  const to = "to" in value ? value.to : undefined
                  return !(from instanceof Date) && !(to instanceof Date)
                },
              },
              chip: {
                formatValue: (value) => {
                  if (typeof value !== "object" || value === null) return ""
                  const from =
                    "from" in value && value.from instanceof Date ? value.from : undefined
                  const to = "to" in value && value.to instanceof Date ? value.to : undefined
                  if (!from || !to) return ""
                  return `${from.toISOString().slice(0, 10)} - ${to.toISOString().slice(0, 10)}`
                },
              },
            },
          ],
          search: false,
        },
      })}
      pagination={false}
    />
  )
}

describe("DataTableQueryPanel composite chip", () => {
  it("复合字段以单个 chip 展示并可一次性清除", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null
    const user = userEvent.setup()

    render(
      <CompositeChipHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await waitFor(() => expect(table).not.toBeNull())
    expect(screen.getByText("时间范围")).toBeInTheDocument()
    expect(screen.getByText("2026-01-01 - 2026-01-07")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "移除筛选 时间范围" }))

    await waitFor(() => {
      expect(table?.filters.state.startTimeMs).toBeNull()
      expect(table?.filters.state.endTimeMs).toBeNull()
    })
  })
})
