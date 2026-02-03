import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_core")({
	component: CoreLayout,
	staticData: {
		title: "系统",
	},
})

function CoreLayout() {
	return <Outlet />
}
