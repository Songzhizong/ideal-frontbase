import { ChevronRight, Command } from "lucide-react"
import * as React from "react"
import { Input } from "@/components/ui/input"

interface SearchCommandProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
	const searchInputRef = React.useRef<HTMLInputElement>(null)

	React.useEffect(() => {
		if (open) {
			searchInputRef.current?.focus()
		}
	}, [open])

	React.useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null
			const isEditable =
				target &&
				(target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)

			if (isEditable) {
				return
			}

			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault()
				onOpenChange(true)
			}

			if (event.key === "Escape") {
				onOpenChange(false)
			}
		}

		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [onOpenChange])

	if (!open) return null

	return (
		<button
			type="button"
			className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-4 py-12 backdrop-blur-sm"
			onClick={() => onOpenChange(false)}
			aria-label="Close search"
		>
			<div
				className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						onOpenChange(false)
					}
				}}
				role="dialog"
				aria-modal="true"
				aria-label="Global search"
			>
				<div className="flex items-center gap-3">
					<Command className="size-4 text-muted-foreground" />
					<Input
						ref={searchInputRef}
						placeholder="Search metrics, teammates, and playbooks..."
						className="h-11 border-border/50 bg-background"
					/>
					<button
						type="button"
						className="flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground transition hover:bg-accent/80"
						onClick={() => onOpenChange(false)}
					>
						Esc
					</button>
				</div>
				<div className="mt-5 space-y-3 text-sm text-muted-foreground">
					<p className="text-xs font-semibold uppercase tracking-[0.2em]">Suggested</p>
					<div className="grid gap-2 sm:grid-cols-2">
						{[
							"Revenue pulse by region",
							"Pipeline velocity report",
							"Customer health playbook",
							"Upcoming syncs",
						].map((item) => (
							<button
								key={item}
								className="flex items-center justify-between rounded-2xl border border-border/50 bg-background px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-border hover:bg-accent"
								type="button"
							>
								{item}
								<ChevronRight className="size-4 text-muted-foreground" />
							</button>
						))}
					</div>
				</div>
			</div>
		</button>
	)
}
