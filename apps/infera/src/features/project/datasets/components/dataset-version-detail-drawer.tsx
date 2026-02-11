import { IdBadge } from "@/features/shared/components"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { ScrollArea } from "@/packages/ui/scroll-area"
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/packages/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { DatasetVersionItem } from "../types/project-datasets"

interface DatasetVersionDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: DatasetVersionItem | null
}

export function DatasetVersionDetailDrawer({
  open,
  onOpenChange,
  version,
}: DatasetVersionDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="w-[820px] max-w-[95vw] p-0 sm:max-w-[820px]">
        <SheetHeader className="border-b border-border/50 px-6 py-5">
          <SheetTitle>数据集版本详情</SheetTitle>
          <SheetDescription>查看 schema、token_stats 和关联任务。</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-108px)]">
          {version ? (
            <div className="space-y-4 px-6 py-6">
              <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">dataset_version_id</p>
                  <IdBadge id={version.datasetVersionId} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">sha256</p>
                  <IdBadge id={version.sha256} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">rows</p>
                  <p className="text-sm tabular-nums">{version.rows}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">storage_uri</p>
                  <p className="font-mono text-xs text-foreground">{version.storageUri}</p>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">prompt_tokens</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {version.tokenStats.promptTokens}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">total_tokens</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {version.tokenStats.totalTokens}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">avg_tokens_per_row</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {version.tokenStats.avgTokensPerRow}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-4">
                <p className="mb-2 text-sm font-semibold">schema JSON</p>
                <pre className="max-h-80 overflow-auto rounded bg-muted/20 p-3 font-mono text-xs">
                  {JSON.stringify(version.schema, null, 2)}
                </pre>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>usage_type</TableHead>
                      <TableHead>target_name</TableHead>
                      <TableHead>created_at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {version.usage.length > 0 ? (
                      version.usage.map((item) => (
                        <TableRow key={`${item.usageType}-${item.targetName}`}>
                          <TableCell>{item.usageType}</TableCell>
                          <TableCell>{item.targetName}</TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                          当前版本暂无引用记录
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </AppSheetContent>
    </Sheet>
  )
}
