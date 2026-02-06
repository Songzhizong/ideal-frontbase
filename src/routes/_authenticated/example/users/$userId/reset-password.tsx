import { createFileRoute } from "@tanstack/react-router"
import { UserResetPasswordPage } from "@/features/example/users"

export const Route = createFileRoute("/_authenticated/example/users/$userId/reset-password")({
	component: UserResetPasswordRoute,
	staticData: {
		title: "重置密码（示例）",
	},
})

function UserResetPasswordRoute() {
	const params = Route.useParams()
	return <UserResetPasswordPage userId={params.userId} />
}
