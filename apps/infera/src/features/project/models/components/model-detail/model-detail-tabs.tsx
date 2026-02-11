import { IdBadge } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import type { ModelTagItem, ModelVersionItem, ProjectModelItem } from "../../types/project-models"

interface ModelDetailTabsProps {
  model: ProjectModelItem
  activeTab: string
  onTabChange: (value: string) => void
  onViewVersion: (version: ModelVersionItem) => void
  onDeleteVersion: (version: ModelVersionItem) => void
  onPromoteTag: (tag: ModelTagItem) => void
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function ModelDetailTabs({
  model,
  activeTab,
  onTabChange,
  onViewVersion,
  onDeleteVersion,
  onPromoteTag,
}: ModelDetailTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="bg-muted/50 p-1">
        <TabsTrigger value="overview" className="cursor-pointer px-4">
          Overview
        </TabsTrigger>
        <TabsTrigger value="versions" className="cursor-pointer px-4">
          Versions
        </TabsTrigger>
        <TabsTrigger value="tags" className="cursor-pointer px-4">
          Tags
        </TabsTrigger>
        <TabsTrigger value="usage" className="cursor-pointer px-4">
          Usage
        </TabsTrigger>
        <TabsTrigger value="audit" className="cursor-pointer px-4">
          Audit
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 border-none p-0 outline-none">
        <div className="grid gap-4 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Model ID</p>
            <IdBadge id={model.modelId} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Latest Version</p>
            <IdBadge id={model.latestVersionId} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">owner_type / visibility</p>
            <p className="text-sm">
              {model.source} / {model.visibility}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">描述</p>
            <p className="text-sm">{model.description}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="versions" className="space-y-4 border-none p-0 outline-none">
        <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>model_version_id</TableHead>
                <TableHead>artifact_type</TableHead>
                <TableHead>format</TableHead>
                <TableHead>sha256</TableHead>
                <TableHead>size</TableHead>
                <TableHead>source</TableHead>
                <TableHead>引用数</TableHead>
                <TableHead>created_at</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {model.versions.map((version) => (
                <TableRow
                  key={version.modelVersionId}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <IdBadge id={version.modelVersionId} />
                  </TableCell>
                  <TableCell>{version.artifactType}</TableCell>
                  <TableCell>{version.format}</TableCell>
                  <TableCell>
                    <IdBadge id={version.sha256} />
                  </TableCell>
                  <TableCell>{version.size}</TableCell>
                  <TableCell>{version.source}</TableCell>
                  <TableCell>{version.usedByCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(version.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewVersion(version)}
                        className="cursor-pointer"
                      >
                        详情
                      </Button>
                      <Button variant="ghost" size="sm" className="cursor-pointer">
                        部署
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteVersion(version)}
                        className="cursor-pointer text-destructive"
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="tags" className="space-y-4 border-none p-0 outline-none">
        <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>tag_name</TableHead>
                <TableHead>points_to</TableHead>
                <TableHead>updated_by</TableHead>
                <TableHead>updated_at</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {model.tags.map((tag) => (
                <TableRow key={tag.tagName} className="hover:bg-muted/50 transition-colors">
                  <TableCell>{tag.tagName}</TableCell>
                  <TableCell>
                    <IdBadge id={tag.versionId} />
                  </TableCell>
                  <TableCell>{tag.updatedBy}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(tag.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPromoteTag(tag)}
                        className="cursor-pointer"
                      >
                        Promote
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="usage" className="space-y-4 border-none p-0 outline-none">
        <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
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
              {model.usage.length > 0 ? (
                model.usage.map((item) => (
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
                    暂无服务引用
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="audit" className="space-y-4 border-none p-0 outline-none">
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
              {model.audits.map((item) => (
                <TableRow key={item.auditId}>
                  <TableCell className="font-mono text-xs">{item.auditId}</TableCell>
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
      </TabsContent>
    </Tabs>
  )
}
