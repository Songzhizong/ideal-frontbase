import { createFileRoute } from "@tanstack/react-router"
import { UserEditPage } from "@/features/example/users"

export const Route = createFileRoute("/_authenticated/example/users/$userId/edit")({
  component: UserEditRoute,
  staticData: {
    title: "编辑用户（示例）",
  },
})

function UserEditRoute() {
  const params = Route.useParams()
  return <UserEditPage userId={params.userId} />
}
