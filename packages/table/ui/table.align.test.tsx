import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/packages/table"
import { createColumnHelper } from "../columns"
import { DataTableRoot } from "./root"
import { DataTableTable } from "./table"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string | null
}

function AlignHarness() {
  const helper = createColumnHelper<RowData>()
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "姓名",
        cell: (ctx) => ctx.getValue(),
      }),
      helper.display({
        id: "actions",
        header: "操作",
        meta: {
          align: "center",
        },
        cell: () => (
          <div data-testid="action-cell" className="flex items-center gap-2">
            <button type="button">编辑</button>
            <button type="button">更多</button>
          </div>
        ),
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
        filters: { q: null },
      },
    }),
    getRowId: (row) => row.id,
  })

  return (
    <DataTableRoot dt={dt}>
      <DataTableTable<RowData> />
    </DataTableRoot>
  )
}

function HelperActionsAlignHarness() {
  const helper = createColumnHelper<RowData>()
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "姓名",
        cell: (ctx) => ctx.getValue(),
      }),
      helper.actions(
        () => (
          <button data-testid="helper-action" type="button">
            编辑
          </button>
        ),
        {
          header: "操作",
          align: "center",
        },
      ),
    ],
    dataSource: local<RowData, Filters>({
      rows: [{ id: "1", name: "Alice" }],
    }),
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: { q: null },
      },
    }),
    getRowId: (row) => row.id,
  })

  return (
    <DataTableRoot dt={dt}>
      <DataTableTable<RowData> />
    </DataTableRoot>
  )
}

describe("DataTableTable align", () => {
  it("meta.align=center 会对齐表头与单元格内容容器", () => {
    render(<AlignHarness />)

    const header = screen.getByRole("columnheader", { name: "操作" })
    expect(header).toHaveClass("text-center")

    const actionCell = screen.getByTestId("action-cell")
    const contentWrapper = actionCell.parentElement
    expect(contentWrapper).not.toBeNull()
    expect(contentWrapper).toHaveClass("flex")
    expect(contentWrapper).toHaveClass("justify-center")
  })

  it("helper.actions align=center 仅通过 meta.align 控制内容居中", () => {
    render(<HelperActionsAlignHarness />)

    const header = screen.getByRole("columnheader", { name: "操作" })
    expect(header).toHaveClass("text-center")

    const actionButton = screen.getByTestId("helper-action")
    const actionsContainer = actionButton.parentElement
    expect(actionsContainer).not.toBeNull()
    expect(actionsContainer).toHaveClass("inline-flex")
    expect(actionsContainer).not.toHaveClass("justify-center")

    const contentWrapper = actionsContainer?.parentElement
    expect(contentWrapper).not.toBeNull()
    expect(contentWrapper).toHaveClass("flex")
    expect(contentWrapper).toHaveClass("justify-center")
  })
})
