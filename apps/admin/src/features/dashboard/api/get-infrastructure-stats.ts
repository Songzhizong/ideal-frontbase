import type { InfrastructureStats } from "../types/infrastructure"

// 模拟数据
const MOCK_STATS: InfrastructureStats = {
  totalUsers: 1248,
  activeUsers: 342,
  totalFiles: 15672,
  storageUsed: "2.4 TB",
  totalTasks: 89,
  runningTasks: 12,
  totalNotifications: 456,
  unreadNotifications: 23,
  systemHealth: "healthy",
  updatedAt: new Date().toISOString(),
}

export function useInfrastructureStats() {
  // 模拟异步数据获取
  return {
    data: MOCK_STATS,
    isLoading: false,
    error: null,
  }
}
