import React from "react"
import ReactDOM from "react-dom/client"
import { AppProvider } from "@/app/providers"
import { initializeApp } from "@/app/initialize"
import "@/app/globals.css"
import { handlers } from "@/mocks/handlers"
import { env } from "@/packages/app-config"
import { enableMocking } from "@/packages/mock-core"
import { initializeTheme } from "@/packages/theme-system"

const rootElement = document.getElementById("root")

if (!rootElement) {
	throw new Error("Root element not found")
}

// Initialize all global configurations
initializeTheme()
initializeApp()

Promise.resolve(
	enableMocking({
		handlers,
		enabled: env.VITE_ENABLE_MOCK === "true",
		baseUrl: import.meta.env.BASE_URL,
	}),
).then(() => {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<AppProvider />
		</React.StrictMode>,
	)
})
