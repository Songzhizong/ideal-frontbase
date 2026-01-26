import { DashboardPage } from "@/features/dashboard/routes/dashboard-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});
