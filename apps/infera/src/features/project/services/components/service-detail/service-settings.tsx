import { useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { DangerConfirmDialog } from "@/features/shared/components"
import { useBaseNavigate } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Textarea } from "@/packages/ui/textarea"
import type { ProjectServiceDetail } from "../../types"
import { splitAllowlist } from "../create-service-wizard.state"
import { isCidrFormat, toErrorMessage } from "../service-formatters"
import type { ReturnTypeUseProjectServiceActions } from "./types"

interface ServiceSettingsTabProps {
  tenantId: string
  projectId: string
  service: ProjectServiceDetail
  actions: ReturnTypeUseProjectServiceActions
}

export function ServiceSettingsTab({
  tenantId,
  projectId,
  service,
  actions,
}: ServiceSettingsTabProps) {
  const navigate = useBaseNavigate()
  const [name, setName] = useState(service.name)
  const [description, setDescription] = useState(service.description)
  const [networkExposure, setNetworkExposure] = useState(service.networkExposure)
  const [allowlistInput, setAllowlistInput] = useState(service.ipAllowlist.join("\n"))
  const [dangerOpen, setDangerOpen] = useState(false)

  const invalidAllowlist = useMemo(() => {
    return splitAllowlist(allowlistInput).filter((item) => !isCidrFormat(item))
  }, [allowlistInput])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-3 text-sm font-medium">基础信息</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>服务名称</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-3 text-sm font-medium">网络配置</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Public / Private</Label>
            <Select
              value={networkExposure}
              onValueChange={(value) => setNetworkExposure(value as typeof networkExposure)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Private" className="cursor-pointer">
                  Private
                </SelectItem>
                <SelectItem value="Public" className="cursor-pointer">
                  Public
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {networkExposure === "Public" ? (
            <div className="space-y-2">
              <Label>IP allowlist</Label>
              <Textarea
                rows={3}
                value={allowlistInput}
                onChange={(event) => setAllowlistInput(event.target.value)}
                placeholder="每行一个 CIDR"
              />
              {invalidAllowlist.length > 0 ? (
                <p className="text-xs text-destructive">无效 CIDR：{invalidAllowlist.join("、")}</p>
              ) : (
                <p className="text-xs text-muted-foreground">支持多行或逗号分隔。</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-3 text-sm font-medium">Runtime & Resources</p>
        <p className="text-xs text-muted-foreground">
          当前 Revision: {service.revisions[0]?.revisionId ?? "-"} · {service.runtime} ·
          {service.resourceSpec.gpuCount}x {service.resourceSpec.gpuModel}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">编辑该区块会触发 Deploy new revision。</p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-3 text-sm font-medium">Autoscaling</p>
        <p className="text-xs text-muted-foreground">
          {service.autoscaling.metricType} · min {service.autoscaling.minReplicas} / max{" "}
          {service.autoscaling.maxReplicas}· delay {service.autoscaling.scaleDownDelaySeconds}s
        </p>
        <p className="mt-2 text-xs text-muted-foreground">编辑该区块会触发 Deploy new revision。</p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-2 text-sm font-medium">合规与留存</p>
        <p className="text-xs text-muted-foreground">
          Prompt/Response 记录策略（占位）：{service.compliance.notice}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="cursor-pointer"
          disabled={invalidAllowlist.length > 0}
          onClick={() => {
            void actions.updateSettingsMutation
              .mutateAsync({
                tenantId,
                projectId,
                serviceId: service.serviceId,
                name: name.trim(),
                description: description.trim(),
                networkExposure,
                ipAllowlist: networkExposure === "Public" ? splitAllowlist(allowlistInput) : [],
              })
              .catch((error: unknown) => {
                toast.error(toErrorMessage(error))
              })
          }}
        >
          保存设置
        </Button>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-destructive">Danger Zone</p>
        <p className="mt-1 text-xs text-destructive/90">
          删除服务后 endpoint 将不可用，关联 API Keys 不会自动删除。
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3 cursor-pointer"
          onClick={() => setDangerOpen(true)}
        >
          删除服务
        </Button>
      </div>

      <DangerConfirmDialog
        open={dangerOpen}
        onOpenChange={setDangerOpen}
        targetName={service.name}
        title="删除服务"
        description="请确认服务名称后删除。"
        onConfirm={async () => {
          try {
            await actions.deleteServiceMutation.mutateAsync({
              tenantId,
              projectId,
              serviceId: service.serviceId,
              confirmName: service.name,
            })
            void navigate({ to: buildProjectPath(tenantId, projectId, "/services") })
          } catch (error: unknown) {
            toast.error(toErrorMessage(error))
            throw error
          }
        }}
      />
    </div>
  )
}
