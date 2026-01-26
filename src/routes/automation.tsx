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
import { Clock, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/automation")({
  component: AutomationPage,
});

function AutomationPage() {
  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Automation
          </span>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Orchestrate your lifecycle playbooks.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Trigger high-signal automations, schedule sequences, and keep
            workflows aligned across teams.
          </p>
        </div>
        <Button>New playbook</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Featured workflows
            </CardTitle>
            <CardDescription>
              Top-performing flows updated in the past 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Onboarding activation sprint",
              "Lifecycle health check",
              "Enterprise renewal prep",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item}</p>
                  <p className="text-xs text-muted-foreground">
                    Last run 2 hours ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Scheduled runs
              </CardTitle>
              <CardDescription>Next 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Retention pulse</span>
                <span className="font-semibold text-foreground">09:30</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Weekly summary</span>
                <span className="font-semibold text-foreground">14:00</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-4 text-emerald-500" />
                Live alerts
              </CardTitle>
              <CardDescription>Monitoring critical actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500">
                All systems green
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Configure alerts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
