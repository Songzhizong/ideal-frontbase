import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  type QuickPresetItem,
  SuperDateRangePicker,
  type SuperDateRangePickerProps,
} from "@/packages/ui"
import type { ChangeReason, ResolvedChangeMeta, ResolvedPayload } from "./core"

const TEST_QUICK_PRESETS: QuickPresetItem[] = [
  {
    key: "last-15m",
    label: "最近 15 分钟",
    group: "最近",
    keywords: ["15m", "15分钟"],
    definition: {
      from: { expr: "now-15m" },
      to: { expr: "now" },
      label: "最近 15 分钟",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "today",
    label: "今天",
    group: "常用",
    definition: {
      from: { expr: "now/d" },
      to: { expr: "now/d", round: "up" },
      label: "今天",
      ui: { editorMode: "relative", rangeTokenMode: "two_endpoints" },
    },
  },
]

function renderPicker(props?: Omit<SuperDateRangePickerProps, "quickPresets">) {
  return render(<SuperDateRangePicker quickPresets={TEST_QUICK_PRESETS} {...props} />)
}

describe("SuperDateRangePicker e2e", () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("Apply emits unified resolved change event", async () => {
    const onResolvedChange =
      vi.fn<(payload: ResolvedPayload | null, meta: ResolvedChangeMeta) => void>()

    const user = userEvent.setup()

    renderPicker({ onResolvedChange })

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))
    await user.click(screen.getByRole("button", { name: "确定" }))

    expect(onResolvedChange).toHaveBeenCalledTimes(1)

    const meta = onResolvedChange.mock.calls[0]?.[1]
    const payload = onResolvedChange.mock.calls[0]?.[0]
    expect(meta).toBeDefined()
    expect(payload).not.toBeNull()
    if (!meta || !payload) {
      throw new Error("missing payload or meta")
    }
    expect(meta.reason).toBe("apply")
  })

  it("typing does not auto-normalize until blur", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))

    const startInput = screen.getByLabelText("开始时间")
    await user.clear(startInput)
    await user.type(startInput, "2026-02-13 10:00")
    expect(startInput).toHaveValue("2026-02-13 10:00")

    await user.tab()
    expect(startInput).toHaveValue("2026-02-13 10:00:00")
  })

  it("Ctrl/Cmd+K focuses quick search input", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))
    const startInput = screen.getByLabelText("开始时间")
    await user.click(startInput)

    fireEvent.keyDown(startInput, { key: "k", ctrlKey: true })

    await waitFor(() => {
      expect(screen.getByLabelText("搜索快捷选项")).toHaveFocus()
    })
  })

  it("shows input parse error with role alert", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))
    const startInput = screen.getByLabelText("开始时间")

    await user.clear(startInput)
    await user.type(startInput, "invalid")

    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("supports empty state and clear action", async () => {
    const user = userEvent.setup()
    const onResolvedChange =
      vi.fn<(payload: ResolvedPayload | null, meta: { reason: ChangeReason }) => void>()

    render(
      <SuperDateRangePicker
        quickPresets={TEST_QUICK_PRESETS}
        allowEmpty
        defaultValue={{
          from: { expr: "now-1h" },
          to: { expr: "now" },
          label: "最近 1 小时",
          ui: { editorMode: "relative" },
        }}
        onResolvedChange={onResolvedChange}
      />,
    )

    const clearAction = document.querySelector("[data-clear-action='true']")
    if (!(clearAction instanceof HTMLElement)) {
      throw new Error("missing clear action")
    }

    await user.click(clearAction)
    expect(onResolvedChange).toHaveBeenCalledTimes(1)
    expect(onResolvedChange.mock.calls[0]?.[0]).toBeNull()
    expect(onResolvedChange.mock.calls[0]?.[1]?.reason).toBe("clear")
    expect(screen.queryByLabelText("开始时间")).not.toBeInTheDocument()
  })

  it("clicking clear icon svg clears without opening popover", async () => {
    const user = userEvent.setup()
    const onResolvedChange =
      vi.fn<(payload: ResolvedPayload | null, meta: { reason: ChangeReason }) => void>()

    render(
      <SuperDateRangePicker
        quickPresets={TEST_QUICK_PRESETS}
        allowEmpty
        defaultValue={{
          from: { expr: "now-1h" },
          to: { expr: "now" },
          label: "最近 1 小时",
          ui: { editorMode: "relative" },
        }}
        onResolvedChange={onResolvedChange}
      />,
    )

    const clearSvg = document.querySelector("[data-clear-action='true'] svg")
    if (!(clearSvg instanceof SVGElement)) {
      throw new Error("missing clear svg")
    }

    await user.click(clearSvg)
    expect(onResolvedChange).toHaveBeenCalledTimes(1)
    expect(onResolvedChange.mock.calls[0]?.[0]).toBeNull()
    expect(onResolvedChange.mock.calls[0]?.[1]?.reason).toBe("clear")
    expect(screen.queryByLabelText("开始时间")).not.toBeInTheDocument()
  })

  it("shows empty placeholder when value is null", () => {
    renderPicker({ allowEmpty: true, value: null })
    expect(screen.getByRole("button", { name: "请选择时间" })).toBeInTheDocument()
  })

  it("shows editor mode switch when manualEditorMode is not provided", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))

    expect(screen.getByText("编辑模式")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "日期时间" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "仅日期" })).toBeInTheDocument()
  })

  it("hides editor mode switch when manualEditorMode is provided", async () => {
    const user = userEvent.setup()

    renderPicker({ manualEditorMode: "date" })

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))

    expect(screen.queryByText("编辑模式")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "日期时间" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "仅日期" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "选择开始时间" }))
    expect(screen.queryByText("小时")).not.toBeInTheDocument()
    expect(screen.queryByText("分钟")).not.toBeInTheDocument()
  })

  it("shows date-only values in inputs and trigger when manualEditorMode is date", async () => {
    const user = userEvent.setup()

    render(
      <SuperDateRangePicker
        quickPresets={TEST_QUICK_PRESETS}
        manualEditorMode="date"
        value={{
          from: { expr: "@wall:2026-02-01 00:00:00" },
          to: { expr: "@wall:2026-02-28 00:00:00" },
          ui: { manualEditorMode: "date" },
        }}
      />,
    )

    const trigger = screen.getByRole("button", { name: /2026/ })
    expect(trigger).toHaveTextContent("~")
    expect(trigger).not.toHaveTextContent(":")

    await user.click(trigger)
    expect(screen.getByLabelText("开始时间")).toHaveValue("2026-02-01")
    expect(screen.getByLabelText("结束时间")).toHaveValue("2026-02-28")
  })

  it("keeps apply enabled for range-order errors and shows clear error after apply", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))

    const startInput = screen.getByLabelText("开始时间")
    const endInput = screen.getByLabelText("结束时间")
    await user.clear(startInput)
    await user.type(startInput, "2026-02-17 00:00:00")
    await user.tab()

    await user.clear(endInput)
    await user.type(endInput, "2026-02-14 23:59:00")
    await user.tab()

    const applyButton = screen.getByRole("button", { name: "确定" })
    expect(applyButton).toBeEnabled()

    await user.click(applyButton)
    expect(screen.getByRole("alert")).toHaveTextContent("结束时间必须晚于开始时间")
  })

  it("shows absolute range text without timezone after manual apply", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))

    const startInput = screen.getByLabelText("开始时间")
    const endInput = screen.getByLabelText("结束时间")

    await user.clear(startInput)
    await user.type(startInput, "2026-02-14 20:50:00")
    await user.tab()

    await user.clear(endInput)
    await user.type(endInput, "2026-02-14 21:05:00")
    await user.tab()

    await user.click(screen.getByRole("button", { name: "确定" }))

    const trigger = screen.getByRole("button", { name: /2026/ })
    expect(trigger).toHaveTextContent("~")
    expect(trigger).not.toHaveTextContent("最近 15 分钟")
    expect(trigger).not.toHaveTextContent("浏览器")
    expect(trigger).not.toHaveTextContent("UTC")
  })

  it("uses date-only summary after apply when switching to date mode", async () => {
    const user = userEvent.setup()

    renderPicker()

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))
    await user.click(screen.getByRole("button", { name: "仅日期" }))

    const startInput = screen.getByLabelText("开始时间")
    const endInput = screen.getByLabelText("结束时间")

    await user.clear(startInput)
    await user.type(startInput, "2026-02-01")
    await user.tab()

    await user.clear(endInput)
    await user.type(endInput, "2026-02-28")
    await user.tab()

    await user.click(screen.getByRole("button", { name: "确定" }))

    const trigger = screen.getByRole("button", { name: /2026/ })
    expect(trigger).toHaveTextContent("~")
    expect(trigger).not.toHaveTextContent(":")
  })

  it("does not emit external_sync when controlled value is stale", async () => {
    const user = userEvent.setup()
    const onResolvedChange =
      vi.fn<(payload: ResolvedPayload | null, meta: ResolvedChangeMeta) => void>()

    render(
      <SuperDateRangePicker
        quickPresets={TEST_QUICK_PRESETS}
        value={{
          from: { expr: "now-15m" },
          to: { expr: "now" },
          label: "最近 15 分钟",
          ui: { editorMode: "relative" },
        }}
        onResolvedChange={onResolvedChange}
      />,
    )

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))

    const startInput = screen.getByLabelText("开始时间")
    const endInput = screen.getByLabelText("结束时间")
    await user.clear(startInput)
    await user.type(startInput, "2026-02-14 20:50:00")
    await user.tab()

    await user.clear(endInput)
    await user.type(endInput, "2026-02-14 21:05:00")
    await user.tab()

    await user.click(screen.getByRole("button", { name: "确定" }))
    await waitFor(() => {
      expect(onResolvedChange).toHaveBeenCalledTimes(1)
    })
    expect(onResolvedChange.mock.calls[0]?.[1]?.reason).toBe("apply")
  })

  it("shows apply error instead of throwing for invalid quick preset", async () => {
    const user = userEvent.setup()

    render(
      <SuperDateRangePicker
        quickPresets={[
          ...TEST_QUICK_PRESETS,
          {
            key: "invalid-round",
            label: "非法取整",
            group: "测试",
            definition: {
              from: { expr: "@wall:2026-02-13 10:00:00", round: "up" },
              to: { expr: "@wall:2026-02-13 11:00:00" },
              label: "非法取整",
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole("button", { name: /最近 15 分钟/i }))
    await user.click(screen.getByRole("button", { name: "非法取整" }))

    expect(screen.getByRole("alert")).toHaveTextContent("当前表达式缺少取整单位")
  })

  it("falls back to placeholder for invalid controlled value instead of crashing", () => {
    render(
      <SuperDateRangePicker
        quickPresets={TEST_QUICK_PRESETS}
        value={{
          from: { expr: "@wall:2026-02-13 10:00:00", round: "up" },
          to: { expr: "@wall:2026-02-13 11:00:00" },
          label: "非法初始值",
        }}
      />,
    )

    expect(screen.getByRole("button", { name: "请选择时间" })).toBeInTheDocument()
  })
})
