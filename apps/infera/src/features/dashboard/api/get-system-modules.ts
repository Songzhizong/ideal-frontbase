import type { SystemModule } from "../types/infrastructure"

// 模拟数据
const MOCK_MODULES: SystemModule[] = [
  {
    id: "1",
    name: "身份识别与访问控制",
    description: "用户认证、权限管理、单点登录",
    status: "active",
    usage: 85,
    lastUpdated: "2024-01-28T10:30:00Z",
  },
  {
    id: "2",
    name: "文件管理",
    description: "文件上传、存储、版本控制",
    status: "active",
    usage: 72,
    lastUpdated: "2024-01-28T09:15:00Z",
  },
  {
    id: "3",
    name: "操作日志",
    description: "系统操作记录、审计追踪",
    status: "active",
    usage: 68,
    lastUpdated: "2024-01-28T08:45:00Z",
  },
  {
    id: "4",
    name: "通知中心",
    description: "消息推送、邮件通知、系统公告",
    status: "active",
    usage: 45,
    lastUpdated: "2024-01-28T11:20:00Z",
  },
  {
    id: "5",
    name: "定时任务",
    description: "任务调度、批处理、自动化执行",
    status: "active",
    usage: 38,
    lastUpdated: "2024-01-28T07:30:00Z",
  },
  {
    id: "6",
    name: "运维管理",
    description: "系统监控、性能分析、故障诊断",
    status: "maintenance",
    usage: 92,
    lastUpdated: "2024-01-28T06:00:00Z",
  },
]

export function useSystemModules() {
  return {
    data: MOCK_MODULES,
    isLoading: false,
    error: null,
  }
}
