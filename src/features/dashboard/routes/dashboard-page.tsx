import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStats } from "@/features/dashboard/api/get-stats";
import { ProfileForm } from "@/features/dashboard/components/profile-form";
import { StatsCard } from "@/features/dashboard/components/stats-card";
import { useSidebar } from "@/components/ui/sidebar";
import { format, parseISO } from "date-fns";
import { Activity, BadgeDollarSign, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const updatedAt = data?.updatedAt
    ? format(parseISO(data.updatedAt), "MMM d, p")
    : "Awaiting fresh data";

  const stats = [
    {
      title: "Total Users",
      value: data ? data.totalUsers.toLocaleString() : "—",
      hint: "All-time cohort strength",
      icon: Users,
      accentClass: "text-slate-900",
    },
    {
      title: "Active Today",
      value: data ? data.activeToday.toLocaleString() : "—",
      hint: "Recent active sessions",
      icon: Activity,
      accentClass: "text-sky-600",
    },
    {
      title: "Conversion Rate",
      value: data ? `${data.conversionRate.toFixed(1)}%` : "—",
      hint: "Trial to paid flow",
      icon: Sparkles,
      accentClass: "text-amber-600",
    },
    {
      title: "Monthly Revenue",
      value: data ? `$${data.revenue.toLocaleString()}` : "—",
      hint: "Projected MRR",
      icon: BadgeDollarSign,
      accentClass: "text-emerald-600",
    },
  ];

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
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                Signal Studio
              </span>
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                Calm dashboards for fast-moving teams.
              </h1>
              <p className="text-base text-slate-600 sm:text-lg">
                Every metric is Zod-validated, query-cached, and ready for
                AI-friendly iteration.{" "}
                {isLoading
                  ? "Syncing the latest pulse."
                  : `Updated ${updatedAt}.`}
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
                Keep your public snapshot aligned with your latest roadmap and
                mindset.
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
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                <p className="text-sm font-semibold text-slate-700">
                  Sidebar layout
                </p>
                <p className="text-sm text-slate-500">
                  {isCollapsed
                    ? "Collapsed: icon-only mode keeps the workspace open."
                    : "Expanded: full navigation labels are available."}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                  Next
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Ship the AI-driven sprint review.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </PageContainer>
  );
}
