import { createFileRoute } from "@tanstack/react-router"
import { Users } from "lucide-react"
import { PageContainer } from "@/components/common/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/team")({
	component: TeamPage,
})

function TeamPage() {
	return (
		<PageContainer className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-3">
					<span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
						Team
					</span>
					<h1 className="text-3xl font-semibold text-primary sm:text-4xl text-foreground">
						Coordinate the growth crew.
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
						Keep leadership, ops, and product aligned with shared priorities and weekly rituals.
					</p>
				</div>
				<Button>Invite teammate</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="size-4 text-muted-foreground" />
							Active squads
						</CardTitle>
						<CardDescription>Cross-functional pods this month.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						{["Activation pod", "Revenue acceleration pod", "Lifecycle retention pod"].map(
							(team) => (
								<div
									key={team}
									className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3"
								>
									<span className="font-semibold text-foreground">{team}</span>
									<Button variant="outline" size="sm">
										View
									</Button>
								</div>
							),
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Upcoming syncs</CardTitle>
						<CardDescription>Weekly rituals and reviews.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
							<p className="text-sm font-semibold text-foreground">Monday launch retro</p>
							<p className="text-xs text-muted-foreground">Mon · 10:00 AM</p>
						</div>
						<div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
							<p className="text-sm font-semibold text-foreground">Pipeline standup</p>
							<p className="text-xs text-muted-foreground">Wed · 3:00 PM</p>
						</div>
						<Button variant="outline" size="sm" className="w-full">
							Manage calendar
						</Button>
					</CardContent>
				</Card>
			</div>
		</PageContainer>
	)
}
