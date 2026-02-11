import { Cpu, Plus, Trash2 } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import type { TenantQuotasSimplePolicy } from "../types/tenant-quotas-budgets"
import {
  formatNullableNumber,
  parseNullableNumberInput,
} from "../utils/tenant-quotas-budgets-formatters"
import { toNumberInputValue, updateSimpleNumberField } from "./quotas-tab-helpers"

interface TenantQuotasSimpleEditorProps {
  draft: TenantQuotasSimplePolicy
  setDraft: Dispatch<SetStateAction<TenantQuotasSimplePolicy>>
  canEdit: boolean
}

export function TenantQuotasSimpleEditor({
  draft,
  setDraft,
  canEdit,
}: TenantQuotasSimpleEditorProps) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="quota-max-projects">最大项目数（可选）</Label>
          <Input
            id="quota-max-projects"
            type="number"
            min={0}
            value={toNumberInputValue(draft.maxProjects)}
            disabled={!canEdit}
            className="cursor-text"
            onChange={(event) => {
              setDraft((current) =>
                updateSimpleNumberField(current, "maxProjects", event.target.value),
              )
            }}
            placeholder="不限制"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quota-max-services">最大服务数（可选）</Label>
          <Input
            id="quota-max-services"
            type="number"
            min={0}
            value={toNumberInputValue(draft.maxServices)}
            disabled={!canEdit}
            className="cursor-text"
            onChange={(event) => {
              setDraft((current) =>
                updateSimpleNumberField(current, "maxServices", event.target.value),
              )
            }}
            placeholder="不限制"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quota-daily-token-limit">每日 Tokens 上限（可选）</Label>
          <Input
            id="quota-daily-token-limit"
            type="number"
            min={0}
            value={toNumberInputValue(draft.dailyTokenLimit)}
            disabled={!canEdit}
            className="cursor-text"
            onChange={(event) => {
              setDraft((current) =>
                updateSimpleNumberField(current, "dailyTokenLimit", event.target.value),
              )
            }}
            placeholder="不限制"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quota-concurrent-requests">并发请求上限（可选）</Label>
          <Input
            id="quota-concurrent-requests"
            type="number"
            min={0}
            value={toNumberInputValue(draft.concurrentRequests)}
            disabled={!canEdit}
            className="cursor-text"
            onChange={(event) => {
              setDraft((current) =>
                updateSimpleNumberField(current, "concurrentRequests", event.target.value),
              )
            }}
            placeholder="不限制"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Cpu className="size-4" aria-hidden />
            GPU 资源池配额
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canEdit}
            className="cursor-pointer"
            onClick={() => {
              setDraft((current) => ({
                ...current,
                gpuPoolQuotas: [
                  ...current.gpuPoolQuotas,
                  {
                    acceleratorType: "",
                    maxCards: null,
                    usedCards: 0,
                  },
                ],
              }))
            }}
          >
            <Plus className="size-4" aria-hidden />
            添加资源池
          </Button>
        </div>

        <div className="space-y-2">
          {draft.gpuPoolQuotas.length === 0 ? (
            <p className="text-xs text-muted-foreground">尚未配置 GPU 资源池配额。</p>
          ) : null}

          {draft.gpuPoolQuotas.map((item, index) => (
            <div
              key={`${item.acceleratorType}-${index}`}
              className="grid gap-2 rounded-md border border-border/50 bg-muted/20 p-3 md:grid-cols-[1.5fr_1fr_1fr_auto]"
            >
              <Input
                value={item.acceleratorType}
                disabled={!canEdit}
                className="cursor-text"
                placeholder="例如 NVIDIA H100"
                onChange={(event) => {
                  const nextValue = event.target.value
                  setDraft((current) => ({
                    ...current,
                    gpuPoolQuotas: current.gpuPoolQuotas.map((quota, quotaIndex) => {
                      if (quotaIndex !== index) {
                        return quota
                      }

                      return {
                        ...quota,
                        acceleratorType: nextValue,
                      }
                    }),
                  }))
                }}
              />
              <Input
                type="number"
                min={0}
                value={toNumberInputValue(item.maxCards)}
                disabled={!canEdit}
                className="cursor-text"
                placeholder="配额"
                onChange={(event) => {
                  const nextValue = parseNullableNumberInput(event.target.value)
                  setDraft((current) => ({
                    ...current,
                    gpuPoolQuotas: current.gpuPoolQuotas.map((quota, quotaIndex) => {
                      if (quotaIndex !== index) {
                        return quota
                      }

                      return {
                        ...quota,
                        maxCards: nextValue,
                      }
                    }),
                  }))
                }}
              />
              <Input
                value={formatNullableNumber(item.usedCards)}
                disabled
                className="cursor-default bg-muted/30"
                placeholder="当前用量"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={!canEdit}
                className="cursor-pointer"
                onClick={() => {
                  setDraft((current) => ({
                    ...current,
                    gpuPoolQuotas: current.gpuPoolQuotas.filter(
                      (_quota, quotaIndex) => quotaIndex !== index,
                    ),
                  }))
                }}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
