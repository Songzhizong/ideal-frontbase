import { useEffect, useRef, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover"
import {
  type SuperDateRangePickerProps,
  useSuperDateRangePickerController,
} from "./super-date-range-picker/state/use-super-date-range-picker-controller"
import { PickerFooter } from "./super-date-range-picker/ui/footer"
import { ManualPanel } from "./super-date-range-picker/ui/manual-panel"
import { QuickPanel } from "./super-date-range-picker/ui/quick-panel"
import { SuperDateRangePickerTrigger } from "./super-date-range-picker/ui/trigger"

export type { SuperDateRangePickerProps }
export * from "./super-date-range-picker/core"

export function SuperDateRangePicker(props: SuperDateRangePickerProps) {
  const controller = useSuperDateRangePickerController(props)

  const [quickQuery, setQuickQuery] = useState("")

  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  const quickSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!controller.isOpen) {
      return
    }

    const focusTarget =
      controller.draft.lastFocused === "from" ? fromInputRef.current : toInputRef.current
    focusTarget?.focus()
  }, [controller.isOpen, controller.draft.lastFocused])

  const warnings = controller.draftPreview.kind === "ok" ? controller.draftPreview.warnings : []
  const applyDisabled = controller.draftPreview.applyDisabled
  const draftError =
    controller.draftPreview.kind === "error"
      ? controller.draftPreview.message
      : controller.syncError

  return (
    <div className="w-full">
      <Popover open={controller.isOpen} onOpenChange={controller.setOpen}>
        <PopoverTrigger asChild>
          <SuperDateRangePickerTrigger
            liveStore={controller.liveStore}
            frozenSnapshot={controller.frozenSnapshot}
            isOpen={controller.isOpen}
            allowEmpty={controller.allowEmpty}
            clearable={controller.clearable}
            placeholder={controller.placeholder}
            onClear={controller.clearSelection}
            {...(controller.locale ? { locale: controller.locale } : {})}
          />
        </PopoverTrigger>

        <PopoverContent
          className="w-[min(96vw,600px)] p-3"
          align="end"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
          }}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
              event.preventDefault()
              quickSearchRef.current?.focus()
              return
            }

            if (event.key === "Enter" && !applyDisabled) {
              event.preventDefault()
              controller.applyDraft()
            }
          }}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,400px)_200px]">
            <ManualPanel
              draft={controller.draft}
              fromDisplayText={controller.fromDisplayText}
              toDisplayText={controller.toDisplayText}
              editorMode={props.manualEditorMode ?? controller.manualEditorMode}
              modeLocked={props.manualEditorMode !== undefined}
              disambiguationEnabled={controller.engine.caps.supportsDisambiguation}
              todayCalendarDate={controller.todayCalendarDate}
              inputRefs={{ from: fromInputRef, to: toInputRef }}
              onTyping={controller.updateDraftByTyping}
              onBlur={controller.updateDraftByBlur}
              onFocus={controller.setDraftFocus}
              onSetDisambiguation={controller.setDraftDisambiguation}
              onCalendarOrScroller={controller.updateDraftByCalendarOrScroller}
              onEditorModeChange={controller.setManualEditorMode}
            />

            <QuickPanel
              presets={controller.quickPresets}
              query={quickQuery}
              onQueryChange={setQuickQuery}
              onSelectPreset={controller.applyQuickPreset}
              searchInputRef={quickSearchRef}
              searchPlaceholder={controller.quickSearchPlaceholder}
              emptyText={controller.quickEmptyText}
            />
          </div>

          <PickerFooter
            timezone={controller.timezone}
            timezoneOptions={controller.timezoneOptions}
            applyDisabled={applyDisabled}
            applyError={controller.applyError}
            draftError={draftError}
            warnings={warnings}
            hasExternalUpdate={controller.hasExternalUpdate}
            onCancel={() => controller.setOpen(false)}
            onApply={controller.applyDraft}
            onResetExternal={controller.resetDraftFromCommitted}
            onChangeTimezone={controller.changeTimezone}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
