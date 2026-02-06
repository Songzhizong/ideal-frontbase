import { createFileRoute } from "@tanstack/react-router"
import { TableV2DemoPage } from "@/pages/examples/table-v2-demo"

export const Route = createFileRoute("/_authenticated/_core/table-v2-demo")({
	component: TableV2DemoPage,
	staticData: {
		title: "Table V2 Demo",
	},
})
