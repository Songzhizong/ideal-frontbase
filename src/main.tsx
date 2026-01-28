import React from "react"
import ReactDOM from "react-dom/client"
import { AppProvider } from "@/app/provider"
import { initializeApp } from "@/app/initialize"
import "@/app/globals.css"
import { enableMocking } from "@/mocks/browser"
import { initializeTheme } from "@/hooks/use-theme-store"

const rootElement = document.getElementById("root")

if (!rootElement) {
	throw new Error("Root element not found")
}

// Initialize all global configurations
initializeTheme()
initializeApp()

Promise.resolve(enableMocking()).then(() => {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<AppProvider />
		</React.StrictMode>,
	)
})
