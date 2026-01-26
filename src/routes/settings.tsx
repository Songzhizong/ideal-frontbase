import { createFileRoute } from "@tanstack/react-router"
import { Settings, SlidersHorizontal } from "lucide-react"
import { PageContainer } from "@/components/common/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
})

function SettingsPage() {
	return (
		<PageContainer className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-3">
					<span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
						Settings
					</span>
					<h1 className="text-3xl font-semibold text-primary sm:text-4xl">
						Tune the workspace controls.
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
						Keep permissions, notifications, and data connections aligned with your operating
						cadence.
					</p>
				</div>
				<Button variant="outline">Download audit log</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="size-4 text-muted-foreground" />
							Workspace controls
						</CardTitle>
						<CardDescription>Access, alerts, and integrations.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						{["Notification routing", "SAML + SSO access", "Data warehouse syncs"].map((item) => (
							<div
								key={item}
								className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
							>
								<span className="font-semibold text-foreground">{item}</span>
								<Button variant="outline" size="sm">
									Configure
								</Button>
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SlidersHorizontal className="size-4 text-muted-foreground" />
							Preferences
						</CardTitle>
						<CardDescription>Defaults applied to new reports.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<div className="rounded-2xl border border-border bg-background px-4 py-3">
							<p className="text-sm font-semibold text-foreground">Weekly digest</p>
							<p className="text-xs text-muted-foreground">Delivered every Monday at 9:00 AM</p>
						</div>
						<div className="rounded-2xl border border-border bg-background px-4 py-3">
							<p className="text-sm font-semibold text-foreground">Default KPI pack</p>
							<p className="text-xs text-muted-foreground">Activation, retention, expansion</p>
						</div>
						<Button variant="outline" size="sm" className="w-full">
							Edit preferences
						</Button>
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	)
}
