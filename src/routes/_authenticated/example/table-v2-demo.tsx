import { createFileRoute } from "@tanstack/react-router"
import { UserManagementPage } from "@/features/example/users"

export const Route = createFileRoute("/_authenticated/example/table-v2-demo")({
  component: UserManagementPage,
  staticData: {
    title: "Table V2 默认示例",
  },
})
