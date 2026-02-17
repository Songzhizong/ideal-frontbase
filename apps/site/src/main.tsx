import React from "react"
import ReactDOM from "react-dom/client"
import { AppProvider } from "@/app/provider"
import "@/app/globals.css"
import { initializeTheme } from "@/packages/theme-system"

const rootElement = document.getElementById("root")

if (!rootElement) {
	throw new Error("Root element not found")
}

initializeTheme()

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<AppProvider />
	</React.StrictMode>,
)
