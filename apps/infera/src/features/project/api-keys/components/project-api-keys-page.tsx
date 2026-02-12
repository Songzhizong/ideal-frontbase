import { Funnel, KeyRound, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import {
  CopySecretOnceDialog,
  DangerConfirmDialog,
  EmptyState,
  ErrorState,
  IdBadge,
} from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useProjectApiKeyActions, useProjectApiKeysQuery } from "../hooks"
import type { ApiKeyFilterState, ApiKeyScope, ProjectApiKeySummary } from "../types"
import {
  downloadTextFile,
  formatDateTime,
  formatLimit,
  formatScopeLabel,
  getApiKeyStatusBadgeClassName,
  getApiKeyStatusText,
  toErrorMessage,
} from "./api-key-formatters"
import { CreateKeyDialog } from "./create-key-dialog"

interface ProjectApiKeysPageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: ApiKeyFilterState = {
  q: "",
  status: "All",
  scope: "All",
  expiringSoon: "all",
}

function ScopeChips({ scopes }: { scopes: ApiKeyScope[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {scopes.map((scope) => (
        <Badge key={scope} variant="outline" className="text-xs">
          {formatScopeLabel(scope)}
        </Badge>
      ))}
    </div>
  )
}

export function ProjectApiKeysPage({ tenantId, projectId }: ProjectApiKeysPageProps) {
  const [filters, setFilters] = useState<ApiKeyFilterState>(DEFAULT_FILTERS)
  const [createOpen, setCreateOpen] = useState(false)
  const [rotateTarget, setRotateTarget] = useState<ProjectApiKeySummary | null>(null)
  const [revokeOldKey, setRevokeOldKey] = useState(true)
  const [revokeTarget, setRevokeTarget] = useState<ProjectApiKeySummary | null>(null)

  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [latestSecret, setLatestSecret] = useState("")
  const [latestSecretName, setLatestSecretName] = useState("")

  const query = useProjectApiKeysQuery(tenantId, projectId, filters)
  const actions = useProjectApiKeyActions({ tenantId, projectId })

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
        className="cursor-pointer"
      >
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden />
        刷新
      </Button>
      <Button type="button" onClick={() => setCreateOpen(true)} className="cursor-pointer">
        <KeyRound className="size-4" aria-hidden />
        创建 API Key
      </Button>
    </div>
  )

  const apiKeys = useMemo(() => query.data ?? [], [query.data])

  return (
    <>
      <ContentLayout
        title="API Keys"
        description="管理项目 API Key 的调用权限、配额与生命周期策略。"
        actions={headerActions}
      >
        <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Input
              value={filters.q}
              placeholder="搜索名称 / api_key_id / scope"
              onChange={(event) => {
                setFilters((previous) => ({ ...previous, q: event.target.value }))
              }}
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => {
              setFilters((previous) => ({
                ...previous,
                status: value as ApiKeyFilterState["status"],
              }))
            }}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="cursor-pointer">
                全部状态
              </SelectItem>
              <SelectItem value="Active" className="cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="Revoked" className="cursor-pointer">
                Revoked
              </SelectItem>
              <SelectItem value="Expired" className="cursor-pointer">
                Expired
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.scope}
            onValueChange={(value) => {
              setFilters((previous) => ({
                ...previous,
                scope: value as ApiKeyFilterState["scope"],
              }))
            }}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="cursor-pointer">
                全部 Scope
              </SelectItem>
              <SelectItem value="inference:invoke" className="cursor-pointer">
                inference:invoke
              </SelectItem>
              <SelectItem value="metrics:read" className="cursor-pointer">
                metrics:read
              </SelectItem>
              <SelectItem value="logs:read" className="cursor-pointer">
                logs:read
              </SelectItem>
              <SelectItem value="audit:read" className="cursor-pointer">
                audit:read
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Select
              value={filters.expiringSoon}
              onValueChange={(value) => {
                setFilters((previous) => ({
                  ...previous,
                  expiringSoon: value as ApiKeyFilterState["expiringSoon"],
                }))
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="即将过期" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  全部
                </SelectItem>
                <SelectItem value="yes" className="cursor-pointer">
                  7 天内过期
                </SelectItem>
                <SelectItem value="no" className="cursor-pointer">
                  不限
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="cursor-pointer"
            >
              <Funnel className="size-4" aria-hidden />
              重置
            </Button>
          </div>
        </div>

        {query.isError ? (
          <ErrorState
            title="API Key 列表加载失败"
            message="请稍后重试，或检查当前项目是否可访问。"
            error={query.error}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : null}

        {query.isPending ? (
          <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            API Key 数据加载中...
          </div>
        ) : null}

        {!query.isPending && !query.isError && apiKeys.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>api_key_id</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>RPM</TableHead>
                  <TableHead>Daily limit</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((item) => (
                  <TableRow key={item.apiKeyId} className="transition-colors hover:bg-muted/50">
                    <TableCell>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.note || "-"}</p>
                    </TableCell>
                    <TableCell>
                      <IdBadge id={item.apiKeyId} />
                    </TableCell>
                    <TableCell>
                      <ScopeChips scopes={item.scopes} />
                    </TableCell>
                    <TableCell className="tabular-nums">{formatLimit(item.rpmLimit)}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatLimit(item.dailyTokenLimit)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(item.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getApiKeyStatusBadgeClassName(item.status)}
                      >
                        {getApiKeyStatusText(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(item.lastUsedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="cursor-pointer">
                          <BaseLink
                            to={buildProjectPath(tenantId, projectId, `/api-keys/${item.apiKeyId}`)}
                          >
                            详情
                          </BaseLink>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            setRotateTarget(item)
                            setRevokeOldKey(true)
                          }}
                        >
                          Rotate
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="cursor-pointer text-destructive"
                          onClick={() => setRevokeTarget(item)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {!query.isPending && !query.isError && apiKeys.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="暂无 API Key"
            description="创建第一个 API Key 后，可在这里管理调用范围、限制与轮换。"
            primaryAction={{
              label: "创建 API Key",
              onClick: () => setCreateOpen(true),
            }}
          />
        ) : null}
      </ContentLayout>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenantId={tenantId}
        projectId={projectId}
        submitting={actions.createMutation.isPending}
        onSubmit={actions.createMutation.mutateAsync}
      />

      <Dialog
        open={rotateTarget !== null}
        onOpenChange={(next) => (!next ? setRotateTarget(null) : null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" aria-hidden />
              Rotate API Key
            </DialogTitle>
            <DialogDescription>
              生成新的密钥明文并控制旧 Key 策略。新密钥仅展示一次。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
            <Label className="text-xs text-muted-foreground">旧 Key 策略</Label>
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card p-2 text-sm">
              <Checkbox
                id="api-keys-rotate-revoke-old"
                checked={revokeOldKey}
                onCheckedChange={(value) => setRevokeOldKey(value === true)}
              />
              <Label htmlFor="api-keys-rotate-revoke-old" className="cursor-pointer text-sm">
                生成新 Key 并立即吊销旧 Key（推荐）
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card p-2 text-sm">
              <Checkbox
                id="api-keys-rotate-keep-old"
                checked={!revokeOldKey}
                onCheckedChange={(value) => setRevokeOldKey(value !== true)}
              />
              <Label htmlFor="api-keys-rotate-keep-old" className="cursor-pointer text-sm">
                生成新 Key，旧 Key 保留（需手动 Revoke）
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRotateTarget(null)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={actions.rotateMutation.isPending || !rotateTarget}
              className="cursor-pointer"
              onClick={async () => {
                if (!rotateTarget) {
                  return
                }
                try {
                  const result = await actions.rotateMutation.mutateAsync({
                    tenantId,
                    projectId,
                    apiKeyId: rotateTarget.apiKeyId,
                    revokeOldKey,
                  })
                  setRotateTarget(null)
                  setLatestSecretName(result.newApiKey.name)
                  setLatestSecret(result.secret)
                  setSecretDialogOpen(true)
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            >
              {actions.rotateMutation.isPending ? (
                <RefreshCcw className="size-4 animate-spin" aria-hidden />
              ) : null}
              生成新 Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DangerConfirmDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeTarget(null)
          }
        }}
        targetName={revokeTarget?.name ?? ""}
        title="吊销 API Key"
        description="吊销后该 Key 将无法继续调用接口，调用请求将返回 401/403。"
        confirmLabel="确认吊销"
        onConfirm={async () => {
          if (!revokeTarget) {
            return
          }
          try {
            await actions.revokeMutation.mutateAsync({
              tenantId,
              projectId,
              apiKeyId: revokeTarget.apiKeyId,
              confirmText: revokeTarget.name,
            })
            setRevokeTarget(null)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <CopySecretOnceDialog
        open={secretDialogOpen}
        onOpenChange={setSecretDialogOpen}
        secret={latestSecret}
        title="保存新 API Key"
        description="密钥仅展示一次，请复制或下载 .txt 后再关闭。"
        acknowledgeLabel="我已保存该密钥"
        confirmLabel="我已保存"
        secondaryAction={{
          label: "下载 .txt",
          onClick: () => {
            downloadTextFile(
              `${latestSecretName || "api-key"}.txt`,
              `${latestSecretName}\n${latestSecret}`,
            )
          },
        }}
      />
    </>
  )
}
