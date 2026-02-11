import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { ModelDependencyConflict } from "../../types/project-models"

interface ModelDependencyConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflict: ModelDependencyConflict | null
  servicePathPrefix: string
}

export function ModelDependencyConflictDialog({
  open,
  onOpenChange,
  conflict,
  servicePathPrefix,
}: ModelDependencyConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>资源被依赖，无法删除</DialogTitle>
          <DialogDescription>
            {conflict?.message ?? "当前模型版本仍被服务修订引用，请先处理依赖后重试。"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Revision</TableHead>
                <TableHead>Env</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead className="text-right">跳转</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(conflict?.dependencies ?? []).map((item) => (
                <TableRow key={`${item.serviceName}-${item.revisionId}`}>
                  <TableCell>{item.serviceName}</TableCell>
                  <TableCell className="font-mono text-xs">{item.revisionId}</TableCell>
                  <TableCell>{item.environment}</TableCell>
                  <TableCell>{item.trafficWeight}</TableCell>
                  <TableCell className="font-mono text-xs">{item.endpoint}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <BaseLink to={`${servicePathPrefix}/${encodeURIComponent(item.serviceName)}`}>
                        查看服务
                      </BaseLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
