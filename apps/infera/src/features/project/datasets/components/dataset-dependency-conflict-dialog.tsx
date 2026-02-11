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
import type { DatasetDependencyConflict } from "../types/project-datasets"

interface DatasetDependencyConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflict: DatasetDependencyConflict | null
}

export function DatasetDependencyConflictDialog({
  open,
  onOpenChange,
  conflict,
}: DatasetDependencyConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>资源被依赖，无法删除</DialogTitle>
          <DialogDescription>
            {conflict?.message ?? "当前数据集版本仍被任务引用，请先解除引用后再删除。"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>usage_type</TableHead>
                <TableHead>target_name</TableHead>
                <TableHead>created_at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(conflict?.usage ?? []).map((item) => (
                <TableRow key={`${item.usageType}-${item.targetName}`}>
                  <TableCell>{item.usageType}</TableCell>
                  <TableCell>{item.targetName}</TableCell>
                  <TableCell>{item.createdAt}</TableCell>
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
