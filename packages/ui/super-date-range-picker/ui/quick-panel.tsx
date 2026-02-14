import { type RefObject, useMemo } from "react"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import type { QuickPresetItem, TimeRangeDefinition } from "../core"

type QuickPanelProps = {
  presets: QuickPresetItem[]
  query: string
  onQueryChange: (value: string) => void
  onSelectPreset: (definition: TimeRangeDefinition) => void
  searchInputRef: RefObject<HTMLInputElement | null>
  searchPlaceholder: string
  emptyText: string
}

type GroupedPresets = {
  title: string
  items: QuickPresetItem[]
}

export function QuickPanel(props: QuickPanelProps) {
  const grouped = useMemo<GroupedPresets[]>(() => {
    const normalized = props.query.trim().toLowerCase()
    const filtered = props.presets.filter((preset) => {
      if (normalized === "") {
        return true
      }

      const haystack = [preset.label, preset.group, ...(preset.keywords ?? [])]
        .join(" ")
        .toLowerCase()
      return haystack.includes(normalized)
    })

    const groupMap = new Map<string, QuickPresetItem[]>()
    for (const preset of filtered) {
      const group = preset.group.trim() || "未分组"
      const current = groupMap.get(group)
      if (current) {
        current.push(preset)
      } else {
        groupMap.set(group, [preset])
      }
    }

    return Array.from(groupMap, ([title, items]) => ({
      title,
      items,
    }))
  }, [props.query, props.presets])

  return (
    <div className="flex h-full min-h-[300px] w-full flex-col gap-3 border-t border-border/50 pt-3 md:min-h-0 md:border-t-0 md:border-l md:pl-3 md:pt-0">
      <Input
        ref={props.searchInputRef}
        value={props.query}
        onChange={(event) => props.onQueryChange(event.target.value)}
        placeholder={props.searchPlaceholder}
        aria-label={props.searchPlaceholder}
        className="h-8"
      />

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {grouped.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">{props.emptyText}</p>
        ) : (
          grouped.map((group) => (
            <QuickGroup
              key={group.title}
              title={group.title}
              items={group.items}
              onSelect={props.onSelectPreset}
            />
          ))
        )}
      </div>
    </div>
  )
}

function QuickGroup(props: {
  title: string
  items: QuickPresetItem[]
  onSelect: (definition: TimeRangeDefinition) => void
}) {
  return (
    <section className="space-y-1">
      <h4 className="text-xs font-medium text-muted-foreground">{props.title}</h4>
      <div className="grid gap-1">
        {props.items.map((item) => (
          <Button
            key={item.key}
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => props.onSelect(item.definition)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </section>
  )
}
