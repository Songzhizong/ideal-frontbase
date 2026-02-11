import { buildProjectPath } from "@/components/workspace/workspace-context"
import { IdBadge } from "@/features/shared/components"
import { BaseLink } from "@/packages/platform-router"
import type { DataTableColumnDef } from "@/packages/table"
import { createColumnHelper, DataTableSortableHeader } from "@/packages/table"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectItem } from "../types/tenant-projects"
import {
  formatCurrency,
  formatDateTime,
  formatTokenCount,
} from "../utils/tenant-projects-formatters"
import { TenantProjectEnvironmentBadge } from "./tenant-project-environment-badge"

interface TenantProjectsRowActionsProps {
  tenantId: string
  project: TenantProjectItem
  canManageProject: boolean
  onOpenSettings: (project: TenantProjectItem) => void
  onRequestDelete: (project: TenantProjectItem) => void
}

const helper = createColumnHelper<TenantProjectItem>()

import { ExternalLink, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"

function TenantProjectsRowActions({
  tenantId,
  project,
  canManageProject,
  onOpenSettings,
  onRequestDelete,
}: TenantProjectsRowActionsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        className="h-8 w-8 cursor-pointer"
        title="进入项目"
      >
        <BaseLink to={buildProjectPath(tenantId, project.projectId, "/dashboard")}>
          <ExternalLink className="h-4 w-4" />
        </BaseLink>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
            <span className="sr-only">打开菜单</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onOpenSettings(project)}>设置</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onRequestDelete(project)}
            disabled={!canManageProject}
            className="text-destructive focus:text-destructive"
          >
            删除项目
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface CreateTenantProjectsColumnsOptions {
  tenantId: string
  canManageProject: boolean
  onOpenSettings: (project: TenantProjectItem) => void
  onRequestDelete: (project: TenantProjectItem) => void
}

export function createTenantProjectsColumns({
  tenantId,
  canManageProject,
  onOpenSettings,
  onRequestDelete,
}: CreateTenantProjectsColumnsOptions): DataTableColumnDef<TenantProjectItem>[] {
  return [
    helper.accessor("projectName", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="项目" />,
      enableSorting: true,
      size: 200,
      minSize: 180,
      cell: ({ row }) => {
        const project = row.original

        return (
          <div className="space-y-1">
            <BaseLink
              to={buildProjectPath(tenantId, project.projectId, "/dashboard")}
              className="block cursor-pointer truncate text-sm font-medium text-foreground transition-colors duration-150 hover:text-primary"
            >
              {project.projectName}
            </BaseLink>
            <IdBadge id={project.projectId} shortLength={8} />
          </div>
        )
      },
      meta: {
        headerLabel: "项目",
      },
    }),
    helper.accessor("environment", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="环境" />,
      enableSorting: true,
      size: 120,
      minSize: 110,
      cell: ({ row }) => <TenantProjectEnvironmentBadge environment={row.original.environment} />,
      meta: {
        headerLabel: "环境",
      },
    }),
    helper.accessor("ownerName", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="Owner" />,
      enableSorting: true,
      size: 140,
      minSize: 120,
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="space-y-1">
            <p className="truncate text-sm font-medium text-foreground">{project.ownerName}</p>
            <p className="truncate text-xs text-muted-foreground">{project.ownerId}</p>
          </div>
        )
      },
      meta: {
        headerLabel: "Owner",
      },
    }),
    helper.accessor("serviceSummary", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="服务数" />,
      enableSorting: true,
      size: 110,
      minSize: 100,
      cell: ({ row }) => {
        const summary = row.original.serviceSummary
        return (
          <span
            className={cn(
              "font-mono text-sm",
              summary.ready === summary.total ? "text-emerald-500" : "text-muted-foreground",
            )}
          >
            {summary.ready}/{summary.total}
          </span>
        )
      },
      meta: {
        headerLabel: "服务数",
        align: "right",
      },
    }),
    helper.accessor("monthlyEstimatedCostCny", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="本月成本" />,
      enableSorting: true,
      size: 110,
      minSize: 100,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-foreground">
          {formatCurrency(row.original.monthlyEstimatedCostCny)}
        </span>
      ),
      meta: {
        headerLabel: "本月成本",
        align: "right",
      },
    }),
    helper.accessor("tokensToday", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="今日 Tokens" />,
      enableSorting: true,
      size: 110,
      minSize: 100,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-foreground">
          {formatTokenCount(row.original.tokensToday)}
        </span>
      ),
      meta: {
        headerLabel: "今日 Tokens",
        align: "right",
      },
    }),
    helper.accessor("updatedAt", {
      header: ({ column }) => <DataTableSortableHeader column={column} label="更新时间" />,
      enableSorting: true,
      size: 165,
      minSize: 150,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.updatedAt)}
        </span>
      ),
      meta: {
        headerLabel: "更新时间",
      },
    }),
    helper.actions(
      (row) => (
        <TenantProjectsRowActions
          tenantId={tenantId}
          project={row.original}
          canManageProject={canManageProject}
          onOpenSettings={onOpenSettings}
          onRequestDelete={onRequestDelete}
        />
      ),
      {
        header: "操作",
        size: 100,
        align: "center",
      },
    ),
  ]
}
