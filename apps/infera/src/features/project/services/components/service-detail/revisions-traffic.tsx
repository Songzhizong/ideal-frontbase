import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ReviewChangesDialog } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Slider } from "@/packages/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useProjectServiceActions } from "../../hooks"
import type { ProjectServiceDetail, ServiceTrafficItem } from "../../types"
import { formatDateTime, formatPercent, toErrorMessage } from "../service-formatters"
import { DeployRevisionDialog } from "./deploy-revision-dialog"
import { RollbackDialog } from "./rollback-dialog"

interface RevisionsTrafficTabProps {
  tenantId: string
  projectId: string
  service: ProjectServiceDetail
}

export function RevisionsTrafficTab({ tenantId, projectId, service }: RevisionsTrafficTabProps) {
  const actions = useProjectServiceActions({ tenantId, projectId, serviceId: service.serviceId })

  const [draftWeights, setDraftWeights] = useState<Record<string, number>>({})
  const [reviewOpen, setReviewOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [rollbackOpen, setRollbackOpen] = useState(false)
  const [rollbackTarget, setRollbackTarget] = useState(service.revisions[0]?.revisionId ?? "")

  useEffect(() => {
    const next: Record<string, number> = {}
    for (const revision of service.revisions) {
      next[revision.revisionId] = revision.trafficWeight
    }
    setDraftWeights(next)
  }, [service.revisions])

  const weightRows = useMemo(() => {
    return service.revisions.map((revision) => ({
      revisionId: revision.revisionId,
      weight: Number((draftWeights[revision.revisionId] ?? 0).toFixed(2)),
      status: revision.status,
    }))
  }, [draftWeights, service.revisions])

  const totalWeight = useMemo(() => {
    return Number(weightRows.reduce((sum, item) => sum + item.weight, 0).toFixed(2))
  }, [weightRows])

  const beforeTraffic = useMemo(() => {
    return service.revisions.map((revision) => ({
      revisionId: revision.revisionId,
      weight: revision.trafficWeight,
    }))
  }, [service.revisions])

  const trafficChanges = useMemo(() => {
    return service.revisions
      .filter((revision) => (draftWeights[revision.revisionId] ?? 0) !== revision.trafficWeight)
      .map((revision) => ({
        field: revision.revisionId,
        before: formatPercent(revision.trafficWeight, 0),
        after: formatPercent(draftWeights[revision.revisionId] ?? 0, 0),
      }))
  }, [draftWeights, service.revisions])

  const hasFailedAllTraffic = weightRows.every((item) => {
    if (item.weight <= 0) {
      return true
    }
    return item.status === "Failed"
  })

  const canSubmitTraffic =
    Math.abs(totalWeight - 100) < 0.01 && trafficChanges.length > 0 && !hasFailedAllTraffic

  const normalizeWeights = () => {
    if (weightRows.length === 0) {
      return
    }
    const sum = weightRows.reduce((acc, item) => acc + item.weight, 0)
    const next: Record<string, number> = {}
    if (sum <= 0) {
      const avg = Number((100 / weightRows.length).toFixed(2))
      for (const item of weightRows) {
        next[item.revisionId] = avg
      }
      const lastRow = weightRows[weightRows.length - 1]
      if (lastRow) {
        next[lastRow.revisionId] = avg + Number((100 - avg * weightRows.length).toFixed(2))
      }
    } else {
      for (const item of weightRows) {
        next[item.revisionId] = Number(((item.weight / sum) * 100).toFixed(2))
      }
      const diff = Number(
        (100 - Object.values(next).reduce((acc, item) => acc + item, 0)).toFixed(2),
      )
      const lastRow = weightRows[weightRows.length - 1]
      if (lastRow) {
        const currentLastWeight = next[lastRow.revisionId] ?? 0
        next[lastRow.revisionId] = Number((currentLastWeight + diff).toFixed(2))
      }
    }
    setDraftWeights(next)
  }

  const setRevisionToFullTraffic = (revisionId: string) => {
    const next: Record<string, number> = {}
    for (const revision of service.revisions) {
      next[revision.revisionId] = revision.revisionId === revisionId ? 100 : 0
    }
    setDraftWeights(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => setDeployOpen(true)} className="cursor-pointer">
          Deploy new revision
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRollbackOpen(true)}
          className="cursor-pointer"
        >
          一键回滚
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>revision_id</TableHead>
              <TableHead>created</TableHead>
              <TableHead>model_version</TableHead>
              <TableHead>runtime</TableHead>
              <TableHead>image_digest</TableHead>
              <TableHead>resource</TableHead>
              <TableHead>autoscaling</TableHead>
              <TableHead>config_hash</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>流量</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {service.revisions.map((revision) => (
              <TableRow key={revision.revisionId} className="transition-colors hover:bg-muted/50">
                <TableCell className="font-mono text-xs">{revision.revisionId}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateTime(revision.createdAt)}
                  <br />
                  {revision.createdBy}
                </TableCell>
                <TableCell className="font-mono text-xs">{revision.modelVersionId}</TableCell>
                <TableCell>{revision.runtime}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {revision.imageDigest}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {revision.resourceSpecSummary}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {revision.autoscalingSummary}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {revision.configHash}
                </TableCell>
                <TableCell>{revision.status}</TableCell>
                <TableCell className="w-[220px]">
                  <div className="space-y-2">
                    <Slider
                      value={[draftWeights[revision.revisionId] ?? 0]}
                      max={100}
                      step={1}
                      onValueChange={(value) =>
                        setDraftWeights((prev) => ({
                          ...prev,
                          [revision.revisionId]: Number((value[0] ?? 0).toFixed(2)),
                        }))
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={draftWeights[revision.revisionId] ?? 0}
                      onChange={(event) =>
                        setDraftWeights((prev) => ({
                          ...prev,
                          [revision.revisionId]: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => setRevisionToFullTraffic(revision.revisionId)}
                    >
                      设置 100%
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => {
                        setRollbackTarget(revision.revisionId)
                        setRollbackOpen(true)
                      }}
                    >
                      回滚到此
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Traffic Editor</p>
            <p className="text-xs text-muted-foreground">
              总权重必须为 100，且不能将全部流量指向 Failed Revision。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={normalizeWeights}
            >
              自动归一化
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              disabled={!canSubmitTraffic}
              onClick={() => setReviewOpen(true)}
            >
              保存流量
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          当前总权重：{formatPercent(totalWeight, 2)}
        </p>
        {hasFailedAllTraffic ? (
          <p className="mt-1 text-xs text-destructive">
            存在风险：不能把全部流量分配给 Failed Revision。
          </p>
        ) : null}
      </div>

      <ReviewChangesDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        title="确认流量变更"
        description="请确认 before/after 差异，建议发布后立即观察 Metrics 指标。"
        changes={trafficChanges}
        before={beforeTraffic}
        after={weightRows}
        onConfirm={async () => {
          try {
            await actions.updateTrafficMutation.mutateAsync({
              tenantId,
              projectId,
              serviceId: service.serviceId,
              weights: weightRows as ServiceTrafficItem[],
            })
            setReviewOpen(false)
          } catch (error: unknown) {
            toast.error(toErrorMessage(error))
            throw error
          }
        }}
      />

      <DeployRevisionDialog
        open={deployOpen}
        onOpenChange={setDeployOpen}
        submitting={actions.deployRevisionMutation.isPending}
        service={service}
        onSubmit={async (payload) => {
          try {
            await actions.deployRevisionMutation.mutateAsync({
              tenantId,
              projectId,
              serviceId: service.serviceId,
              ...payload,
            })
          } catch (error: unknown) {
            toast.error(toErrorMessage(error))
            throw error
          }
        }}
      />

      <RollbackDialog
        open={rollbackOpen}
        onOpenChange={setRollbackOpen}
        revisions={service.revisions.map((item) => ({
          revisionId: item.revisionId,
          createdAt: item.createdAt,
          status: item.status,
        }))}
        targetRevisionId={rollbackTarget}
        onTargetChange={setRollbackTarget}
        submitting={actions.rollbackMutation.isPending}
        onConfirm={async () => {
          try {
            await actions.rollbackMutation.mutateAsync({
              tenantId,
              projectId,
              serviceId: service.serviceId,
              targetRevisionId: rollbackTarget,
            })
            setRollbackOpen(false)
          } catch (error: unknown) {
            toast.error(toErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
