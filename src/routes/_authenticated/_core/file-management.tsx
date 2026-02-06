import { createFileRoute, redirect } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { FileManagerPage } from "@/features/file-management"
import { authStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_authenticated/_core/file-management")({
  beforeLoad: () => {
    const { hasPermission } = authStore.getState()
    if (!hasPermission(PERMISSIONS.FILE_MANAGEMENT_VIEW)) {
      throw redirect({
        to: "/errors/403",
      })
    }
  },
  component: FileManagerPage,
  staticData: {
    title: "文件管理",
  },
})
