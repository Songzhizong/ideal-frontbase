import { format, parseISO } from "date-fns"
import { Activity, BadgeDollarSign, Sparkles, Users } from "lucide-react"
import { motion } from "motion/react"
import { PageContainer } from "@/components/common/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSidebar } from "@/components/ui/sidebar"
import { useDashboardStats } from "@/features/dashboard/api/get-stats"
import { ProfileForm } from "@/features/dashboard/components/profile-form"
import { StatsCard } from "@/features/dashboard/components/stats-card"

export function DashboardPage() {
	const { data, isLoading } = useDashboardStats()
	const { state } = useSidebar()
	const isCollapsed = state === "collapsed"

	const updatedAt = data?.updatedAt
		? format(parseISO(data.updatedAt), "MMM d, p")
		: "Awaiting fresh data"

	const stats = [
		{
			title: "Total Users",
			value: data ? data.totalUsers.toLocaleString() : "—",
			hint: "All-time cohort strength",
			icon: Users,
			accentClass: "text-primary",
		},
		{
			title: "Active Today",
			value: data ? data.activeToday.toLocaleString() : "—",
			hint: "Recent active sessions",
			icon: Activity,
			accentClass: "text-primary",
		},
		{
			title: "Conversion Rate",
			value: data ? `${data.conversionRate.toFixed(1)}%` : "—",
			hint: "Trial to paid flow",
			icon: Sparkles,
			accentClass: "text-warning",
		},
		{
			title: "Monthly Revenue",
			value: data ? `$${data.revenue.toLocaleString()}` : "—",
			hint: "Projected MRR",
			icon: BadgeDollarSign,
			accentClass: "text-success",
		},
	]

	return (
		<PageContainer>
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="flex flex-col gap-10"
			>
				<section className="flex flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-2xl space-y-3">
							<span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
								Signal Studio
							</span>
							<h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
								Calm dashboards for fast-moving teams.
							</h1>
							<p className="text-base text-muted-foreground sm:text-lg">
								Every metric is Zod-validated, query-cached, and ready for AI-friendly iteration.{" "}
								{isLoading ? "Syncing the latest pulse." : `Updated ${updatedAt}.`}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button variant="outline">Export snapshot</Button>
							<Button>Launch experiment</Button>
						</div>
					</div>
				</section>

				<motion.section
					initial="hidden"
					animate="show"
					variants={{
						hidden: { opacity: 0 },
						show: {
							opacity: 1,
							transition: { staggerChildren: 0.08 },
						},
					}}
					className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
				>
					{stats.map((stat) => (
						<motion.div
							key={stat.title}
							variants={{
								hidden: { opacity: 0, y: 12 },
								show: { opacity: 1, y: 0 },
							}}
						>
							<StatsCard {...stat} />
						</motion.div>
					))}
				</motion.section>

				<section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<Card>
						<CardHeader>
							<CardTitle>Profile broadcast</CardTitle>
							<CardDescription>
								Keep your public snapshot aligned with your latest roadmap and mindset.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProfileForm />
						</CardContent>
					</Card>

					<Card className="flex flex-col justify-between">
						<CardHeader>
							<CardTitle>Navigation state</CardTitle>
							<CardDescription>
								Sidebar state persists across sessions for consistent context.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-5">
								<p className="text-sm font-semibold text-foreground">Sidebar layout</p>
								<p className="text-sm text-muted-foreground">
									{isCollapsed
										? "Collapsed: icon-only mode keeps the workspace open."
										: "Expanded: full navigation labels are available."}
								</p>
							</div>
							<div className="rounded-2xl bg-primary p-4 text-primary-foreground">
								<p className="text-xs uppercase tracking-[0.3em] opacity-70">Next</p>
								<p className="mt-2 text-lg font-semibold">Ship the AI-driven sprint review.</p>
							</div>
						</CardContent>
					</Card>
				</section>
			</motion.div>
		</PageContainer>
	)
}
