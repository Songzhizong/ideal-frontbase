import type { RequestHandler } from "msw"
import { setupWorker } from "msw/browser"

interface EnableMockingOptions {
	handlers: RequestHandler[]
	enabled: boolean
	baseUrl: string
}

export async function enableMocking({
	handlers,
	enabled,
	baseUrl,
}: EnableMockingOptions): Promise<void> {
	if (!enabled) {
		return
	}

	const worker = setupWorker(...handlers)

	console.log("Starting MSW...")
	await worker.start({
		onUnhandledRequest: "bypass",
		serviceWorker: {
			url: `${baseUrl}mockServiceWorker.js`,
			options: {
				scope: baseUrl,
			},
		},
	})
	console.log("[MSW] Mocking enabled.")
}
