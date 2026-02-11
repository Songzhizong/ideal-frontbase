import { Funnel } from "lucide-react"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { ServiceCurrentState, ServiceFilterState, ServiceRuntime } from "../types"

interface ServiceListFiltersProps {
  filters: ServiceFilterState
  modelOptions: string[]
  onChange: (filters: ServiceFilterState) => void
  onReset: () => void
}

const STATE_OPTIONS: Array<ServiceCurrentState | "All"> = [
  "All",
  "Pending",
  "Downloading",
  "Starting",
  "Ready",
  "Inactive",
  "Failed",
]

const RUNTIME_OPTIONS: Array<ServiceRuntime | "All"> = ["All", "vLLM", "TGI", "Triton", "HF"]

export function ServiceListFilters({
  filters,
  modelOptions,
  onChange,
  onReset,
}: ServiceListFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-7">
      <div className="lg:col-span-2">
        <Input
          placeholder="搜索服务名 / endpoint / model"
          value={filters.q}
          onChange={(event) => onChange({ ...filters, q: event.target.value })}
        />
      </div>

      <Select
        value={filters.env}
        onValueChange={(value) => onChange({ ...filters, env: value as ServiceFilterState["env"] })}
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="环境" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All" className="cursor-pointer">
            全部环境
          </SelectItem>
          {(["Dev", "Test", "Prod"] as const).map((env) => (
            <SelectItem key={env} value={env} className="cursor-pointer">
              {env}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.state}
        onValueChange={(value) =>
          onChange({
            ...filters,
            state: value as ServiceFilterState["state"],
          })
        }
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          {STATE_OPTIONS.map((state) => (
            <SelectItem key={state} value={state} className="cursor-pointer">
              {state === "All" ? "全部状态" : state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.runtime}
        onValueChange={(value) =>
          onChange({
            ...filters,
            runtime: value as ServiceFilterState["runtime"],
          })
        }
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Runtime" />
        </SelectTrigger>
        <SelectContent>
          {RUNTIME_OPTIONS.map((runtime) => (
            <SelectItem key={runtime} value={runtime} className="cursor-pointer">
              {runtime === "All" ? "全部 Runtime" : runtime}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.model}
        onValueChange={(value) =>
          onChange({
            ...filters,
            model: value as ServiceFilterState["model"],
          })
        }
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="模型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All" className="cursor-pointer">
            全部模型
          </SelectItem>
          {modelOptions.map((modelId) => (
            <SelectItem key={modelId} value={modelId} className="cursor-pointer">
              {modelId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Select
          value={filters.onlyInactive}
          onValueChange={(value) =>
            onChange({
              ...filters,
              onlyInactive: value as ServiceFilterState["onlyInactive"],
            })
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Inactive" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部
            </SelectItem>
            <SelectItem value="yes" className="cursor-pointer">
              仅 Inactive
            </SelectItem>
            <SelectItem value="no" className="cursor-pointer">
              排除 Inactive
            </SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={onReset} className="cursor-pointer">
          <Funnel className="size-4" />
          重置
        </Button>
      </div>
    </div>
  )
}
