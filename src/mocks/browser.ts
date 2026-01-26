import { setupWorker } from "msw/browser"
import { handlers } from "@/mocks/handlers"

export const worker = setupWorker(...handlers)

export async function enableMocking() {
	if (!import.meta.env.DEV) {
		return
	}

	await worker.start({
		onUnhandledRequest: "bypass",
	})
}
