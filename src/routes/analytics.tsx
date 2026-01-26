import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Target } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Insights
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Performance signals in one view.
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Monitor revenue movement, activation trends, and retention cohorts
            with live context.
          </p>
        </div>
        <Button>Share report</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="size-4 text-sky-500" />
              Cohort performance
            </CardTitle>
            <CardDescription>Last 30 days of signal lift.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <p className="text-sm font-semibold text-slate-700">
                Visualization placeholder
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Connect your charts or embed real-time monitoring here.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Net retention", "118%"],
                ["Expansion lift", "+23%"],
                ["Activation rate", "64%"],
                ["Churn delta", "-1.2%"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-rose-500" />
              Priority focus
            </CardTitle>
            <CardDescription>Weekly targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Objectives
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Improve trial activation to 70%
              </p>
              <p className="text-sm text-slate-500">
                Keep the focus on guided tours and lifecycle nudges.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Review goals
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
