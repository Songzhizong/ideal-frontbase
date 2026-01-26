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
import { Settings, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Settings
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Tune the workspace controls.
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Keep permissions, notifications, and data connections aligned with
            your operating cadence.
          </p>
        </div>
        <Button variant="outline">Download audit log</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-4 text-slate-500" />
              Workspace controls
            </CardTitle>
            <CardDescription>Access, alerts, and integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {[
              "Notification routing",
              "SAML + SSO access",
              "Data warehouse syncs",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="font-semibold text-slate-800">{item}</span>
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
              <SlidersHorizontal className="size-4 text-slate-500" />
              Preferences
            </CardTitle>
            <CardDescription>Defaults applied to new reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Weekly digest
              </p>
              <p className="text-xs text-slate-500">
                Delivered every Monday at 9:00 AM
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Default KPI pack
              </p>
              <p className="text-xs text-slate-500">
                Activation, retention, expansion
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Edit preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
