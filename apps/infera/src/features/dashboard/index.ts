// Dashboard feature public API

// Hooks
export { useInfrastructureStats } from "./api/get-infrastructure-stats"
export { useRecentActivities } from "./api/get-recent-activities"
export { useSystemModules } from "./api/get-system-modules"
export { RecentActivityList } from "./components/recent-activity-list"
export { StatsCard } from "./components/stats-card"
export { SystemModuleCard } from "./components/system-module-card"
export { InfrastructureDashboard } from "./routes/infrastructure-dashboard"
// Types
export type { InfrastructureStats, RecentActivity, SystemModule } from "./types/infrastructure"
