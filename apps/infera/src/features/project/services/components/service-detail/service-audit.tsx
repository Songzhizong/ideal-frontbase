import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { ProjectServiceDetail } from "../../types"
import { formatDateTime } from "../service-formatters"

interface ServiceAuditTabProps {
  service: ProjectServiceDetail
}

export function ServiceAuditTab({ service }: ServiceAuditTabProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
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
          {service.audits.map((audit) => (
            <TableRow key={audit.auditId} className="transition-colors hover:bg-muted/50">
              <TableCell className="font-mono text-xs">{audit.auditId}</TableCell>
              <TableCell>{audit.action}</TableCell>
              <TableCell>{audit.actor}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTime(audit.happenedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
