import { Button } from "@/packages/ui/button"
import type { ResolveWarning, TimeZoneMode } from "../core"

type FooterProps = {
  timezone: TimeZoneMode
  timezoneOptions: TimeZoneMode[]
  applyDisabled: boolean
  applyError: string | null
  draftError: string | null
  warnings: ResolveWarning[]
  hasExternalUpdate: boolean
  onChangeTimezone: (timezone: TimeZoneMode) => void
  onCancel: () => void
  onApply: () => void
  onResetExternal: () => void
}

export function PickerFooter(props: FooterProps) {
  const options = props.timezoneOptions.map((timezone) => ({
    timezone,
    value: serializeTimezone(timezone),
    label: formatTimezoneLabel(timezone),
  }))

  return (
    <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">时区</span>
          <select
            className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm"
            value={serializeTimezone(props.timezone)}
            onChange={(event) => {
              const matched = options.find((option) => option.value === event.target.value)
              if (matched) {
                props.onChangeTimezone(matched.timezone)
              }
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={props.onCancel}>
            取消
          </Button>
          <Button type="button" size="sm" onClick={props.onApply} disabled={props.applyDisabled}>
            确定
          </Button>
        </div>
      </div>

      {props.hasExternalUpdate ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-xs">
          <span>时间范围已被外部更新。</span>
          <Button type="button" variant="ghost" size="sm" onClick={props.onResetExternal}>
            重置
          </Button>
        </div>
      ) : null}

      {props.applyError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs text-destructive"
        >
          {props.applyError}
        </div>
      ) : props.draftError ? (
        <output className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs text-destructive">
          {props.draftError}
        </output>
      ) : null}

      {props.warnings.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-xs">
          {props.warnings.map((warning) => (
            <li key={`${warning.code}-${warning.message}`}>
              {`${warning.code}: ${toLocalizedWarningMessage(warning.code, warning.message)}`}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function serializeTimezone(timezone: TimeZoneMode): string {
  if (timezone.kind === "utc") {
    return "utc"
  }

  if (timezone.kind === "browser") {
    return "browser"
  }

  return `iana:${timezone.tz}`
}

function formatTimezoneLabel(timezone: TimeZoneMode): string {
  if (timezone.kind === "utc") {
    return "UTC"
  }

  if (timezone.kind === "browser") {
    return "浏览器"
  }

  return timezone.tz
}

function toLocalizedWarningMessage(code: string, fallbackMessage: string): string {
  if (code === "DST_GAP_SHIFTED") {
    return "不存在的本地时间已自动顺延到下一个有效时间点。"
  }

  if (code === "DST_OVERLAP_DEFAULT_EARLIER") {
    return "遇到夏令时重叠且未指定消歧策略，已默认使用较早时间点。"
  }

  if (code === "DST_OVERLAP_FORCED_EARLIER") {
    return "当前引擎无法精确区分重叠时间，已强制使用较早时间点。"
  }

  return fallbackMessage
}
