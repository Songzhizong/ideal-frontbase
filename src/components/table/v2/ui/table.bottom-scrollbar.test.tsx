import { act, fireEvent, render, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/components/table/v2"
import { createColumnHelper } from "../columns"
import { DataTablePagination } from "./pagination"
import { DataTableRoot } from "./root"
import { DataTableTable } from "./table"

type RowData = {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

type Filters = {
  q: string | null
}

function getRequiredElement<T extends Element>(container: HTMLElement, selector: string): T {
  const element = container.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
  return element
}

function setHorizontalMetrics(element: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(element, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  })
  Object.defineProperty(element, "clientWidth", {
    configurable: true,
    value: clientWidth,
  })
  Object.defineProperty(element, "scrollLeft", {
    configurable: true,
    writable: true,
    value: 0,
  })
}

function BottomScrollbarHarness() {
  const helper = createColumnHelper<RowData>()
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "Name",
        cell: (ctx) => ctx.getValue(),
        size: 280,
      }),
      helper.accessor("email", {
        header: "Email",
        cell: (ctx) => ctx.getValue(),
        size: 320,
      }),
      helper.accessor("phone", {
        header: "Phone",
        cell: (ctx) => ctx.getValue(),
        size: 280,
      }),
      helper.accessor("role", {
        header: "Role",
        cell: (ctx) => ctx.getValue(),
        size: 240,
      }),
    ],
    dataSource: local<RowData, Filters>({
      rows: [
        {
          id: "1",
          name: "Alice",
          email: "alice@example.com",
          phone: "13000000000",
          role: "admin",
        },
      ],
      total: 1,
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
    <DataTableRoot dt={dt} layout={{ stickyHeader: true, stickyPagination: true }}>
      <DataTableTable<RowData> />
      <DataTablePagination />
    </DataTableRoot>
  )
}

describe("DataTableTable bottom horizontal scrollbar", () => {
  it("window + stickyHeader 模式下仅保留底部横向滚动条", async () => {
    const { container } = render(<BottomScrollbarHarness />)

    const bodyScroll = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-container"]',
    )
    const headerScroll = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-header-scroll"]',
    )
    const footerScroll = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-horizontal-scrollbar"]',
    )
    const footerWrapper = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-horizontal-scrollbar-wrapper"]',
    )

    expect(headerScroll).toHaveClass("overflow-x-hidden")
    expect(bodyScroll).toHaveClass("scrollbar-none")
    expect(footerWrapper.getAttribute("style")).toContain("--dt-sticky-pagination-height")

    setHorizontalMetrics(bodyScroll, 1200, 600)
    setHorizontalMetrics(headerScroll, 1200, 600)
    setHorizontalMetrics(footerScroll, 1200, 600)

    act(() => {
      window.dispatchEvent(new Event("resize"))
    })

    await waitFor(() => {
      expect(footerWrapper).not.toHaveClass("hidden")
    })
  })

  it("底部横向滚动条滚动时会同步表体与表头", async () => {
    const { container } = render(<BottomScrollbarHarness />)

    const bodyScroll = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-container"]',
    )
    const headerScroll = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-header-scroll"]',
    )
    const footerScroll = getRequiredElement<HTMLDivElement>(
      container,
      '[data-slot="table-horizontal-scrollbar"]',
    )

    setHorizontalMetrics(bodyScroll, 1200, 600)
    setHorizontalMetrics(headerScroll, 1200, 600)
    setHorizontalMetrics(footerScroll, 1200, 600)

    act(() => {
      window.dispatchEvent(new Event("resize"))
    })

    act(() => {
      footerScroll.scrollLeft = 180
      fireEvent.scroll(footerScroll)
    })

    await waitFor(() => {
      expect(bodyScroll.scrollLeft).toBe(180)
      expect(headerScroll.scrollLeft).toBe(180)
    })
  })
})
