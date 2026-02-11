/**
 * Application Initialization
 *
 * 在应用启动前配置全局基础设施
 * 这里是配置跨层依赖的正确位置
 */

import { toast } from "sonner"
import { configureQueryClient } from "@/app/query-client"
import { router } from "@/app/router"
import { buildProjectPath, buildTenantPath } from "@/components/workspace/workspace-context"
import { configureHttpClient, type HttpAuditSuccessEvent } from "@/features/core/api/http-client"
import { createDebouncedUnauthorizedHandler } from "@/features/core/auth"
import { authStore } from "@/packages/auth-core"

function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function resolveAuditTargetPath(pathname: string) {
  const projectMatch = pathname.match(
    /\/infera-api\/tenants\/(?<tenantId>[^/]+)\/projects\/(?<projectId>[^/]+)/iu,
  )
  if (projectMatch?.groups?.tenantId && projectMatch.groups.projectId) {
    return buildProjectPath(
      decodePathSegment(projectMatch.groups.tenantId),
      decodePathSegment(projectMatch.groups.projectId),
      "/audit",
    )
  }

  const tenantMatch = pathname.match(/\/infera-api\/tenants\/(?<tenantId>[^/]+)/iu)
  if (tenantMatch?.groups?.tenantId) {
    return buildTenantPath(decodePathSegment(tenantMatch.groups.tenantId), "/audit")
  }

  return "/profile"
}

function handleAuditSuccess(event: HttpAuditSuccessEvent) {
  if (!event.auditId) {
    return
  }

  let pathname = ""
  try {
    pathname = new URL(event.url, window.location.origin).pathname.toLowerCase()
  } catch {
    pathname = ""
  }

  if (pathname.includes("/auth/login") || pathname.includes("/iam/logout")) {
    return
  }

  toast.success("操作成功，已写入审计日志。", {
    action: {
      label: "查看审计记录",
      onClick: () => {
        const targetPath = resolveAuditTargetPath(pathname)
        void router.navigate({
          to: targetPath,
        })
      },
    },
  })
}

/**
 * 配置 API Client 的认证行为
 * 注入 Auth 业务逻辑到基础设施层
 */
export function initializeApiClient() {
  configureHttpClient({
    getToken: () => authStore.getState().token,
    getTenantId: () => {
      const state = authStore.getState()
      return state.tenantId ?? state.user?.tenantId ?? null
    },
    onAuditSuccess: handleAuditSuccess,
  })

  configureQueryClient({
    onUnauthorized: createDebouncedUnauthorizedHandler(),
  })
}

/**
 * 初始化所有全局配置
 * 在应用渲染前调用
 */
export function initializeApp() {
  initializeApiClient()
  initializeClickTracker()
}

/**
 * 追踪最后一次点击的位置，用于动画起源点
 */
function initializeClickTracker() {
  if (typeof window === "undefined") return

  document.addEventListener(
    "mousedown",
    (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      // 计算点击位置相对于中心点的偏移量（缩放 10% 作为一个起始点的微调）
      const dx = (e.clientX - cx) * 0.1
      const dy = (e.clientY - cy) * 0.1

      document.documentElement.style.setProperty("--last-click-x", `${e.clientX}px`)
      document.documentElement.style.setProperty("--last-click-y", `${e.clientY}px`)
      document.documentElement.style.setProperty("--last-click-offset-x", `${dx}px`)
      document.documentElement.style.setProperty("--last-click-offset-y", `${dy}px`)
    },
    true,
  )
}
