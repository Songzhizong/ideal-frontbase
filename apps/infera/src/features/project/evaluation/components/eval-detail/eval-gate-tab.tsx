import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { EmptyState } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { EvaluationRunDetail } from "../../types"

interface EvalGateTabProps {
  run: EvaluationRunDetail
  promoting: boolean
  onPromote: () => Promise<void>
}

export function EvalGateTab({ run, promoting, onPromote }: EvalGateTabProps) {
  if (run.evalType !== "gate") {
    return (
      <EmptyState
        title="当前评估无门禁规则"
        description="仅回归门禁评估展示 Gate 规则与 Promote 联动。"
      />
    )
  }

  const passed = run.gateRules.every((rule) => rule.passed)

  return (
    <div className="space-y-4">
      <div
        className={
          passed
            ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4"
            : "rounded-lg border border-red-500/30 bg-red-500/10 p-4"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {passed ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="size-4 text-red-500" />
            )}
            <p className={passed ? "text-sm text-emerald-500" : "text-sm text-red-500"}>
              {passed
                ? "门禁通过：允许 Promote 到 prod tag"
                : "门禁未通过：已禁止 Promote，请根据建议调整后重评"}
            </p>
          </div>
          <Button
            type="button"
            disabled={!passed || promoting}
            onClick={() => {
              void onPromote()
            }}
            className="cursor-pointer"
          >
            Promote to prod tag
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>规则</TableHead>
              <TableHead>阈值</TableHead>
              <TableHead>本次结果</TableHead>
              <TableHead>结论</TableHead>
              <TableHead>建议</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {run.gateRules.map((rule) => (
              <TableRow key={rule.ruleId} className="transition-colors hover:bg-muted/50">
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.threshold}</TableCell>
                <TableCell>{rule.actual}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      rule.passed
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        : "border-red-500/20 bg-red-500/10 text-red-500"
                    }
                  >
                    {rule.passed ? "Passed" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{rule.suggestion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
