import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { ProfileLayout } from "@/features/profile"

const profileSearchSchema = z.object({
	tab: z.enum(["general", "security", "sessions", "logs", "preferences", "advanced"]).optional(),
})

export const Route = createFileRoute("/_authenticated/profile")({
	component: ProfileLayout,
	validateSearch: profileSearchSchema,
	staticData: {
		title: "个人中心",
	},
})
