import { KeyRound, RefreshCcw, ShieldAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { CopySecretOnceDialog, EmptyState, ErrorState } from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import { useBaseNavigate } from "@/packages/platform-router"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useProjectApiKeyActions, useProjectApiKeyDetailQuery } from "../../hooks"
import { downloadTextFile, toErrorMessage } from "../api-key-formatters"
import { KeyAuditTab } from "./key-audit-tab"
import { KeyOverviewTab } from "./key-overview-tab"
import { KeyUsageTab } from "./key-usage-tab"

interface ApiKeyDetailPageProps {
  tenantId: string
  projectId: string
  apiKeyId: string
  initialTab?: ApiKeyDetailTab | undefined
}

type ApiKeyDetailTab = "overview" | "usage" | "audit"

export function ApiKeyDetailPage({
  tenantId,
  projectId,
  apiKeyId,
  initialTab,
}: ApiKeyDetailPageProps) {
  const navigate = useBaseNavigate()
  const [activeTab, setActiveTab] = useState<ApiKeyDetailTab>(initialTab ?? "overview")
  const [rotateOpen, setRotateOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [revokeOldKey, setRevokeOldKey] = useState(true)
  const [revokeConfirmText, setRevokeConfirmText] = useState("")

  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [latestSecretName, setLatestSecretName] = useState("")
  const [latestSecret, setLatestSecret] = useState("")

  const query = useProjectApiKeyDetailQuery(tenantId, projectId, apiKeyId)
  const actions = useProjectApiKeyActions({ tenantId, projectId, apiKeyId })

  const apiKey = query.data

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const canRevoke = useMemo(() => {
    if (!apiKey) {
      return false
    }
    const confirmText = revokeConfirmText.trim()
    return confirmText === apiKey.name || confirmText === "REVOKE"
  }, [apiKey, revokeConfirmText])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
      >
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden />
        刷新
      </Button>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={() => setRotateOpen(true)}
        disabled={!apiKey}
      >
        Rotate Key
      </Button>
      <Button
        type="button"
        variant="destructive"
        className="cursor-pointer"
        onClick={() => {
          setRevokeConfirmText("")
          setRevokeOpen(true)
        }}
        disabled={!apiKey || apiKey.status === "Revoked"}
      >
        Revoke Key
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title={apiKey ? `Key: ${apiKey.name}` : "Key 详情"}
        description="查看 Key 的权限、调用用量与审计轨迹。"
        actions={headerActions}
      >
        {query.isPending ? (
          <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            Key 详情加载中...
          </div>
        ) : null}

        {query.isError ? (
          <ErrorState
            title="Key 详情加载失败"
            message="无法获取 Key 详情，请稍后重试。"
            error={query.error}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : null}

        {!query.isPending && !query.isError && !apiKey ? (
          <EmptyState
            icon={ShieldAlert}
            title="未找到该 API Key"
            description="该 Key 可能已删除或当前项目无权限访问。"
            primaryAction={{
              label: "返回列表",
              onClick: () => {
                void navigate({ to: buildProjectPath(tenantId, projectId, "/api-keys") })
              },
            }}
          />
        ) : null}

        {!query.isPending && !query.isError && apiKey ? (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ApiKeyDetailTab)}
            className="space-y-4"
          >
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="cursor-pointer px-4">
                Overview
              </TabsTrigger>
              <TabsTrigger value="usage" className="cursor-pointer px-4">
                Usage
              </TabsTrigger>
              <TabsTrigger value="audit" className="cursor-pointer px-4">
                Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 border-none p-0 outline-none">
              <KeyOverviewTab apiKey={apiKey} />
            </TabsContent>

            <TabsContent value="usage" className="space-y-4 border-none p-0 outline-none">
              <KeyUsageTab apiKey={apiKey} />
            </TabsContent>

            <TabsContent value="audit" className="space-y-4 border-none p-0 outline-none">
              <KeyAuditTab audits={apiKey.audits} />
            </TabsContent>
          </Tabs>
        ) : null}
      </ContentLayout>

      <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" aria-hidden />
              Rotate Key
            </DialogTitle>
            <DialogDescription>生成新 Key 并选择旧 Key 的保留策略。</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card p-2 text-sm">
              <Checkbox
                id="rotate-revoke-old"
                checked={revokeOldKey}
                onCheckedChange={(value) => setRevokeOldKey(value === true)}
              />
              <Label htmlFor="rotate-revoke-old" className="cursor-pointer text-sm">
                生成新 Key 并立即吊销旧 Key
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card p-2 text-sm">
              <Checkbox
                id="rotate-keep-old"
                checked={!revokeOldKey}
                onCheckedChange={(value) => setRevokeOldKey(value !== true)}
              />
              <Label htmlFor="rotate-keep-old" className="cursor-pointer text-sm">
                生成新 Key，旧 Key 保留
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setRotateOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              disabled={actions.rotateMutation.isPending || !apiKey}
              onClick={async () => {
                if (!apiKey) {
                  return
                }
                try {
                  const result = await actions.rotateMutation.mutateAsync({
                    tenantId,
                    projectId,
                    apiKeyId: apiKey.apiKeyId,
                    revokeOldKey,
                  })
                  setRotateOpen(false)
                  setLatestSecretName(result.newApiKey.name)
                  setLatestSecret(result.secret)
                  setSecretDialogOpen(true)
                  void navigate({
                    to: buildProjectPath(
                      tenantId,
                      projectId,
                      `/api-keys/${result.newApiKey.apiKeyId}`,
                    ),
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            >
              生成新 Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">吊销 API Key</DialogTitle>
            <DialogDescription>
              请输入 Key 名称或 REVOKE 确认吊销。吊销后调用将返回 401/403。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <Label htmlFor="api-key-revoke-confirm">确认文本</Label>
            <Input
              id="api-key-revoke-confirm"
              value={revokeConfirmText}
              onChange={(event) => setRevokeConfirmText(event.target.value)}
              placeholder={apiKey ? `${apiKey.name} 或 REVOKE` : "REVOKE"}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setRevokeOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              disabled={actions.revokeMutation.isPending || !apiKey || !canRevoke}
              onClick={async () => {
                if (!apiKey) {
                  return
                }
                try {
                  await actions.revokeMutation.mutateAsync({
                    tenantId,
                    projectId,
                    apiKeyId: apiKey.apiKeyId,
                    confirmText: revokeConfirmText.trim(),
                  })
                  setRevokeOpen(false)
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            >
              确认吊销
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
