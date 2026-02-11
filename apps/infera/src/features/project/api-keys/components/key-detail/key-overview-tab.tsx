import { IdBadge } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import type { ProjectApiKeyDetail } from "../../types"
import {
  formatDateTime,
  formatLimit,
  formatScopeLabel,
  getApiKeyStatusBadgeClassName,
  getApiKeyStatusText,
} from "../api-key-formatters"

interface KeyOverviewTabProps {
  apiKey: ProjectApiKeyDetail
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-lg border border-border/50 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

export function KeyOverviewTab({ apiKey }: KeyOverviewTabProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">基础信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-border/50 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">api_key_id</p>
              <IdBadge id={apiKey.apiKeyId} />
            </div>

            <div className="space-y-1 rounded-lg border border-border/50 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">状态</p>
              <Badge variant="outline" className={getApiKeyStatusBadgeClassName(apiKey.status)}>
                {getApiKeyStatusText(apiKey.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Scopes</p>
            <div className="flex flex-wrap gap-2">
              {apiKey.scopes.map((scope) => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {formatScopeLabel(scope)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <OverviewField label="RPM limit" value={formatLimit(apiKey.rpmLimit)} />
            <OverviewField label="Daily token limit" value={formatLimit(apiKey.dailyTokenLimit)} />
            <OverviewField label="Expires at" value={formatDateTime(apiKey.expiresAt)} />
            <OverviewField label="Last used" value={formatDateTime(apiKey.lastUsedAt)} />
            <OverviewField label="Created by" value={apiKey.createdBy} />
            <OverviewField label="Created at" value={formatDateTime(apiKey.createdAt)} />
            <OverviewField label="Updated at" value={formatDateTime(apiKey.updatedAt)} />
            <OverviewField label="Revoked at" value={formatDateTime(apiKey.revokedAt)} />
          </div>

          <div className="space-y-1 rounded-lg border border-border/50 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">备注</p>
            <p className="text-sm text-foreground">{apiKey.note || "-"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
