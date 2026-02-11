import { EmptyState, IdBadge } from "@/features/shared/components"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { ApiKeyAuditItem } from "../../types"
import { formatDateTime } from "../api-key-formatters"

interface KeyAuditTabProps {
  audits: ApiKeyAuditItem[]
}

export function KeyAuditTab({ audits }: KeyAuditTabProps) {
  if (audits.length === 0) {
    return <EmptyState title="暂无审计记录" description="该 Key 的操作日志会在此处展示。" />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>audit_id</TableHead>
            <TableHead>action</TableHead>
            <TableHead>actor</TableHead>
            <TableHead>happened_at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audits.map((item) => (
            <TableRow key={item.auditId} className="transition-colors hover:bg-muted/50">
              <TableCell>
                <IdBadge id={item.auditId} />
              </TableCell>
              <TableCell>{item.action}</TableCell>
              <TableCell>{item.actor}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTime(item.happenedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
