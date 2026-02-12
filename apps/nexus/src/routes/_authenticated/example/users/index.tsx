import { createFileRoute } from "@tanstack/react-router"
import { UserManagementPage } from "@/features/example/users"

export const Route = createFileRoute("/_authenticated/example/users/")({
  component: UserManagementPage,
  staticData: {
    title: "用户管理（示例）",
  },
})
