import React from "react"
import ReactDOM from "react-dom/client"
import { AppProvider } from "@/app/provider"
import "@/app/globals.css"
import { enableMocking } from "@/mocks/browser"

const rootElement = document.getElementById("root")

if (!rootElement) {
	throw new Error("Root element not found")
}

Promise.resolve(enableMocking()).then(() => {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<AppProvider />
		</React.StrictMode>,
	)
})
