import { IdBadge } from "@/features/shared/components"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { ScrollArea } from "@/packages/ui/scroll-area"
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/packages/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { ModelVersionItem } from "../../types/project-models"

interface ModelVersionDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: ModelVersionItem | null
}

export function ModelVersionDetailDrawer({
  open,
  onOpenChange,
  version,
}: ModelVersionDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="w-[880px] max-w-[95vw] p-0 sm:max-w-[880px]">
        <SheetHeader className="border-b border-border/50 px-6 py-5">
          <SheetTitle>版本详情</SheetTitle>
          <SheetDescription>查看版本元数据、来源和引用关系。</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-108px)]">
          {version ? (
            <div className="space-y-4 px-6 py-6">
              <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">model_version_id</p>
                  <IdBadge id={version.modelVersionId} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">base_model_version_id</p>
                  <p className="font-mono text-xs text-foreground">
                    {version.baseModelVersionId ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">sha256</p>
                  <IdBadge id={version.sha256} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">size</p>
                  <p className="text-sm text-foreground">{version.size}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-4">
                <p className="mb-3 text-sm font-semibold">Metadata JSON</p>
                <pre className="max-h-80 overflow-auto rounded-lg bg-muted/20 p-3 font-mono text-xs">
                  {JSON.stringify(version.metadata, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-4">
                <p className="mb-3 text-sm font-semibold">引用列表</p>
                <div className="overflow-x-auto rounded-lg border border-border/50">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Revision</TableHead>
                        <TableHead>Env</TableHead>
                        <TableHead>Traffic</TableHead>
                        <TableHead>Endpoint</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {version.dependencies.length > 0 ? (
                        version.dependencies.map((item) => (
                          <TableRow key={`${item.serviceName}-${item.revisionId}`}>
                            <TableCell>{item.serviceName}</TableCell>
                            <TableCell className="font-mono text-xs">{item.revisionId}</TableCell>
                            <TableCell>{item.environment}</TableCell>
                            <TableCell>{item.trafficWeight}</TableCell>
                            <TableCell className="font-mono text-xs">{item.endpoint}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                            当前版本暂无引用关系
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </AppSheetContent>
    </Sheet>
  )
}
