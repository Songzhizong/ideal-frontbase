import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { EvaluationRunDetail } from "../../types"

interface EvalReportTabProps {
  run: EvaluationRunDetail
}

export function EvalReportTab({ run }: EvalReportTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {run.reportMetrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-border/50 bg-card px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{metric.value}</p>
            {metric.trend ? (
              <p className="mt-1 text-xs text-muted-foreground">{metric.trend}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>segment</TableHead>
              <TableHead>loss</TableHead>
              <TableHead>perplexity</TableHead>
              <TableHead>rouge-l</TableHead>
              <TableHead>pass_rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {run.reportRows.map((row) => (
              <TableRow key={row.segment} className="transition-colors hover:bg-muted/50">
                <TableCell>{row.segment}</TableCell>
                <TableCell className="tabular-nums">{row.loss.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">{row.perplexity.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">{row.rougeL.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">{(row.passRate * 100).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
        结论摘要：{run.summaryConclusion}
      </div>
    </div>
  )
}
