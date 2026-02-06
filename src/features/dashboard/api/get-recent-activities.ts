import type { RecentActivity } from "../types/infrastructure"

// 模拟数据
const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: "1",
    type: "login",
    user: "张三",
    description: "用户登录系统",
    timestamp: "2024-01-28T11:45:00Z",
  },
  {
    id: "2",
    type: "file_upload",
    user: "李四",
    description: "上传文件 project-docs.pdf",
    timestamp: "2024-01-28T11:30:00Z",
  },
  {
    id: "3",
    type: "task_complete",
    user: "系统",
    description: "定时任务 '数据备份' 执行完成",
    timestamp: "2024-01-28T11:15:00Z",
  },
  {
    id: "4",
    type: "notification",
    user: "王五",
    description: "发送系统公告通知",
    timestamp: "2024-01-28T11:00:00Z",
  },
  {
    id: "5",
    type: "system",
    user: "系统",
    description: "系统健康检查完成",
    timestamp: "2024-01-28T10:45:00Z",
  },
  {
    id: "6",
    type: "login",
    user: "赵六",
    description: "用户登录系统",
    timestamp: "2024-01-28T10:30:00Z",
  },
]

export function useRecentActivities() {
  return {
    data: MOCK_ACTIVITIES,
    isLoading: false,
    error: null,
  }
}
