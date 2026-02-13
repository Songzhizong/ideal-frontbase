import type { DataTableQueryField } from "@/packages/table"
import {
  DEMO_USER_DEPARTMENTS,
  DEMO_USER_ROLES,
  DEMO_USER_STATUSES,
  type DemoUserFilters,
} from "../types"

export const ROLE_LABEL: Record<(typeof DEMO_USER_ROLES)[number], string> = {
  super_admin: "超级管理员",
  employee: "普通员工",
  partner: "外部伙伴",
}

export const STATUS_LABEL: Record<(typeof DEMO_USER_STATUSES)[number], string> = {
  active: "激活",
  disabled: "禁用",
  locked: "锁定",
}

export function buildUserQueryFields(): Array<DataTableQueryField<DemoUserFilters>> {
  return [
    {
      id: "q",
      label: "搜索",
      kind: "text",
      search: {
        pickerVisible: false,
      },
      ui: {
        panel: "hidden",
      },
      placeholder: "搜索姓名、邮箱、手机号",
      binding: {
        mode: "single",
        key: "q",
      },
    },
    {
      id: "status",
      label: "状态",
      kind: "select",
      placeholder: "全部",
      binding: {
        mode: "single",
        key: "status",
      },
      options: DEMO_USER_STATUSES.map((status) => ({
        label: STATUS_LABEL[status],
        value: status,
      })),
    },
    {
      id: "role",
      label: "角色",
      kind: "select",
      placeholder: "全部",
      binding: {
        mode: "single",
        key: "role",
      },
      options: DEMO_USER_ROLES.map((role) => ({
        label: ROLE_LABEL[role],
        value: role,
      })),
    },
    {
      id: "nameKeyword",
      label: "姓名",
      kind: "text",
      ui: {
        panel: "secondary",
      },
      placeholder: "输入姓名关键字",
      binding: {
        mode: "single",
        key: "nameKeyword",
      },
    },
    {
      id: "department",
      label: "部门",
      kind: "select",
      ui: {
        panel: "secondary",
      },
      placeholder: "全部",
      binding: {
        mode: "single",
        key: "department",
      },
      options: DEMO_USER_DEPARTMENTS.map((department) => ({
        label: department,
        value: department,
      })),
    },
    {
      id: "isOnline",
      label: "在线状态",
      kind: "boolean",
      ui: {
        panel: "secondary",
      },
      binding: {
        mode: "single",
        key: "isOnline",
      },
    },
    {
      id: "riskScoreRange",
      label: "风险分区间",
      kind: "number-range",
      ui: {
        panel: "secondary",
      },
      binding: {
        mode: "single",
        key: "riskScoreRange",
      },
    },
    {
      id: "createdAtDate",
      label: "创建日期",
      kind: "date",
      ui: {
        panel: "secondary",
      },
      binding: {
        mode: "single",
        key: "createdAtDate",
      },
    },
    {
      id: "lastLoginRange",
      label: "最近登录区间",
      kind: "date-range",
      ui: {
        panel: "secondary",
      },
      binding: {
        mode: "single",
        key: "lastLoginRange",
      },
    },
  ]
}
