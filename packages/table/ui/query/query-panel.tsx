import { ChevronDown, ChevronUp } from "lucide-react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"
import { useDataTableConfig } from "../config/provider"
import { useDataTableLayout } from "../table/context"
import { normalizeDataTablePresetQuery } from "./normalize"
import { DataTableQueryChips } from "./query-chips"
import { DataTableQueryFieldItem } from "./query-field-item"
import { DataTableQuerySearch } from "./query-search"
import type { DataTablePresetQueryProps } from "./types"

function hasCustomWidthClassName(className?: string): boolean {
  if (!className) return false
  const tokens = className.split(/\s+/).filter((token) => token.length > 0)
  for (const token of tokens) {
    const rawToken = token.split(":").pop()
    if (!rawToken) continue
    const normalizedToken = rawToken.startsWith("!") ? rawToken.slice(1) : rawToken
    if (
      normalizedToken.startsWith("w-") ||
      normalizedToken.startsWith("min-w-") ||
      normalizedToken.startsWith("max-w-") ||
      normalizedToken.startsWith("basis-") ||
      normalizedToken === "flex-none" ||
      normalizedToken === "flex-1"
    ) {
      return true
    }
  }
  return false
}

export function DataTableQueryPanel<TFilterSchema>({
  className,
  schema,
  layout,
  slots,
}: DataTablePresetQueryProps<TFilterSchema>) {
  const { i18n } = useDataTableConfig()
  const normalized = useMemo(
    () =>
      normalizeDataTablePresetQuery({
        schema,
        ...(className ? { className } : {}),
        ...(layout ? { layout } : {}),
        ...(slots ? { slots } : {}),
      }),
    [className, schema, layout, slots],
  )
  const layoutState = useDataTableLayout()
  const stickyQueryPanel = layoutState?.stickyQueryPanel ?? false
  const isStickyQueryPanel = stickyQueryPanel === true || typeof stickyQueryPanel === "object"
  const rootRef = useRef<HTMLDivElement>(null)
  const [expandedState, setExpandedState] = useState(normalized.layout.secondaryDefaultExpanded)
  const secondaryExpanded = normalized.layout.secondaryExpanded ?? expandedState

  const setSecondaryExpanded = (nextExpanded: boolean) => {
    if (normalized.layout.secondaryExpanded == null) {
      setExpandedState(nextExpanded)
    }
    normalized.layout.onSecondaryExpandedChange?.(nextExpanded)
  }

  useLayoutEffect(() => {
    const panelElement = rootRef.current
    if (!panelElement) return

    const dataTableRoot = panelElement.closest<HTMLElement>('[data-slot="data-table-root"]')
    if (!dataTableRoot) return

    if (!isStickyQueryPanel) {
      dataTableRoot.style.removeProperty("--dt-sticky-query-height")
      return
    }

    const updateStickyHeight = () => {
      const height = panelElement.offsetHeight
      dataTableRoot.style.setProperty("--dt-sticky-query-height", `${height}px`)
    }

    updateStickyHeight()

    if (typeof ResizeObserver === "undefined") {
      return () => {
        dataTableRoot.style.removeProperty("--dt-sticky-query-height")
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateStickyHeight()
    })
    resizeObserver.observe(panelElement)
    window.addEventListener("resize", updateStickyHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateStickyHeight)
      dataTableRoot.style.removeProperty("--dt-sticky-query-height")
    }
  }, [isStickyQueryPanel])

  const primaryFields = normalized.layout.primaryFieldIds
    .map((fieldId) => normalized.schema.fieldMap.get(fieldId))
    .filter((field) => field != null)
  const secondaryFields = normalized.layout.secondaryFieldIds
    .map((fieldId) => normalized.schema.fieldMap.get(fieldId))
    .filter((field) => field != null)
  const searchFields =
    normalized.schema.search?.searchableFieldIds
      .map((fieldId) => normalized.schema.fieldMap.get(fieldId))
      .filter((field) => field != null) ?? []
  const searchPickerFields =
    normalized.schema.search?.pickerFieldIds
      .map((fieldId) => normalized.schema.fieldMap.get(fieldId))
      .filter((field) => field != null) ?? []

  const hasSecondary = secondaryFields.length > 0
  const secondaryCollapsible = hasSecondary && normalized.layout.secondaryCollapsible
  const showSecondaryRow = hasSecondary && (!secondaryCollapsible || secondaryExpanded)
  const hasSearchCustomWidth = hasCustomWidthClassName(normalized.schema.search?.className)
  const resolveFieldClassName = (customClassName?: string) => {
    return cn(!hasCustomWidthClassName(customClassName) && "min-w-[180px]", customClassName)
  }

  const toggleButton = secondaryCollapsible ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 shrink-0 px-2 text-muted-foreground hover:text-foreground"
      onClick={() => setSecondaryExpanded(!secondaryExpanded)}
      aria-expanded={secondaryExpanded}
    >
      {secondaryExpanded ? i18n.filterBar.collapseText : i18n.filterBar.expandText}
      {secondaryExpanded ? (
        <ChevronUp className="ml-1 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </Button>
  ) : null

  const primaryRow = (
    <div className="flex min-w-0 flex-wrap items-end gap-3">
      {normalized.layout.showSearch && normalized.schema.search ? (
        <DataTableQuerySearch
          searchableFields={searchFields}
          pickerFields={searchPickerFields}
          defaultFieldId={normalized.schema.search.defaultFieldId}
          mode={normalized.schema.search.mode}
          debounceMs={normalized.schema.search.debounceMs}
          {...(normalized.schema.search.placeholder
            ? { placeholder: normalized.schema.search.placeholder }
            : {})}
          className={cn(
            !hasSearchCustomWidth && "min-w-[240px]",
            normalized.schema.search.className,
          )}
        />
      ) : null}
      {primaryFields.map((field) => (
        <DataTableQueryFieldItem
          key={String(field.id)}
          field={field}
          labelMode={normalized.layout.primaryFieldLabelMode}
          className={resolveFieldClassName(field.ui?.containerClassName)}
        />
      ))}
      {toggleButton}
    </div>
  )

  const hasActions = Boolean(normalized.slots.actionsLeft || normalized.slots.actionsRight)
  const actionsRow = hasActions ? (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">{normalized.slots.actionsLeft}</div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {normalized.slots.actionsRight}
      </div>
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      className={cn(
        "border-b border-border/50 bg-card px-3 pt-3 pb-2",
        isStickyQueryPanel && "sticky top-[var(--dt-query-top,var(--dt-sticky-top,0px))] z-20",
        normalized.className,
      )}
    >
      <div className="flex flex-col gap-3">
        {normalized.layout.mode === "stacked" ? (
          <>
            {actionsRow}
            {primaryRow}
          </>
        ) : hasActions ? (
          <div className="flex flex-col gap-2 xl:flex-row xl:items-end">
            <div className="flex flex-wrap items-center gap-2">{normalized.slots.actionsLeft}</div>
            <div className={cn("min-w-0", normalized.layout.inlineQueryGrow && "xl:flex-1")}>
              {primaryRow}
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 xl:ml-auto xl:justify-end">
              {normalized.slots.actionsRight}
            </div>
          </div>
        ) : (
          primaryRow
        )}

        {showSecondaryRow ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {secondaryFields.map((field) => (
              <DataTableQueryFieldItem
                key={String(field.id)}
                field={field}
                labelMode={normalized.layout.secondaryFieldLabelMode}
                {...(field.ui?.containerClassName
                  ? { className: field.ui.containerClassName }
                  : {})}
              />
            ))}
          </div>
        ) : null}

        {normalized.layout.chipsVisible ? (
          <DataTableQueryChips
            fields={normalized.schema.fields}
            showClearAll={normalized.layout.chipsShowClearAll}
            {...(normalized.layout.chipsClearAllLabel
              ? { clearLabel: normalized.layout.chipsClearAllLabel }
              : {})}
          />
        ) : null}
      </div>
    </div>
  )
}
