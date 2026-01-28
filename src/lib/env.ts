import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_API_BASE_URL: z.string(),
		VITE_AUTH_CLIENT_ID: z.string(),
		VITE_APP_ID: z.string(),
		VITE_DEFAULT_USERNAME: z.string().optional(),
		VITE_DEFAULT_PASSWORD: z.string().optional(),
	},
	runtimeEnv: import.meta.env,
})
