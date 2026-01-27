/**
 * Example Component - Using Design Tokens
 * Demonstrates how to use semantic CSS variables in components
 */

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ThemedCardExample() {
	return (
		<Card
			className="p-6"
			style={{
				backgroundColor: "var(--color-bg-container)",
				borderColor: "var(--color-border-base)",
			}}
		>
			<h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
				Design Token System
			</h2>
			<p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
				This card uses semantic CSS variables that automatically adapt to the selected theme and
				mode.
			</p>

			<div className="flex gap-2">
				<Button
					style={{
						backgroundColor: "var(--color-primary)",
						color: "var(--color-brand-text)",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "var(--color-primary)"
					}}
				>
					Primary Action
				</Button>

				<Button
					variant="outline"
					style={{
						borderColor: "var(--color-border-base)",
						color: "var(--color-text-primary)",
					}}
				>
					Secondary
				</Button>
			</div>

			<div className="mt-4 grid grid-cols-4 gap-2">
				<div
					className="h-12 rounded"
					style={{ backgroundColor: "var(--color-success)" }}
					title="Success"
				/>
				<div
					className="h-12 rounded"
					style={{ backgroundColor: "var(--color-warning)" }}
					title="Warning"
				/>
				<div
					className="h-12 rounded"
					style={{ backgroundColor: "var(--color-error)" }}
					title="Error"
				/>
				<div
					className="h-12 rounded"
					style={{ backgroundColor: "var(--color-info)" }}
					title="Info"
				/>
			</div>
		</Card>
	)
}
