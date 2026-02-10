import { createFileRoute } from "@tanstack/react-router"
import { UserCreatePage } from "@/features/example/users"

export const Route = createFileRoute("/_authenticated/example/users/new")({
  component: UserCreatePage,
  staticData: {
    title: "新增用户（示例）",
  },
})
