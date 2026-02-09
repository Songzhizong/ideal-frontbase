import type { FilterDefinition } from "@/packages/table"
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

const NAME_KEYWORD_FILTER: FilterDefinition<DemoUserFilters, "nameKeyword"> = {
  key: "nameKeyword",
  label: "姓名",
  type: "text",
  placeholder: "输入姓名关键字后回车",
  defaultVisible: true,
}

const STATUS_FILTER: FilterDefinition<DemoUserFilters, "status"> = {
  key: "status",
  label: "状态",
  type: "select",
  placeholder: "全部",
  options: DEMO_USER_STATUSES.map((status) => ({
    label: STATUS_LABEL[status],
    value: status,
  })),
  alwaysVisible: true,
}

const ROLE_FILTER: FilterDefinition<DemoUserFilters, "role"> = {
  key: "role",
  label: "角色",
  type: "select",
  placeholder: "全部",
  options: DEMO_USER_ROLES.map((role) => ({
    label: ROLE_LABEL[role],
    value: role,
  })),
  defaultVisible: true,
}

const DEPARTMENT_FILTER: FilterDefinition<DemoUserFilters, "department"> = {
  key: "department",
  label: "部门",
  type: "select",
  placeholder: "全部",
  options: DEMO_USER_DEPARTMENTS.map((department) => ({
    label: department,
    value: department,
  })),
  defaultVisible: true,
}

const IS_ONLINE_FILTER: FilterDefinition<DemoUserFilters, "isOnline"> = {
  key: "isOnline",
  label: "在线状态",
  type: "boolean",
  defaultVisible: true,
}

const RISK_SCORE_FILTER: FilterDefinition<DemoUserFilters, "riskScoreRange"> = {
  key: "riskScoreRange",
  label: "风险分区间",
  type: "number-range",
  defaultVisible: true,
}

const CREATED_AT_FILTER: FilterDefinition<DemoUserFilters, "createdAtDate"> = {
  key: "createdAtDate",
  label: "创建日期",
  type: "date",
}

const LAST_LOGIN_RANGE_FILTER: FilterDefinition<DemoUserFilters, "lastLoginRange"> = {
  key: "lastLoginRange",
  label: "最近登录区间",
  type: "date-range",
}

export function buildUserFilterDefinitions(): Array<
  FilterDefinition<DemoUserFilters, keyof DemoUserFilters>
> {
  return [
    NAME_KEYWORD_FILTER,
    STATUS_FILTER,
    ROLE_FILTER,
    DEPARTMENT_FILTER,
    IS_ONLINE_FILTER,
    RISK_SCORE_FILTER,
    CREATED_AT_FILTER,
    LAST_LOGIN_RANGE_FILTER,
  ] as Array<FilterDefinition<DemoUserFilters, keyof DemoUserFilters>>
}

export function buildToolbarUserFilterDefinitions(): Array<
  FilterDefinition<DemoUserFilters, keyof DemoUserFilters>
> {
  return [STATUS_FILTER, ROLE_FILTER] as Array<
    FilterDefinition<DemoUserFilters, keyof DemoUserFilters>
  >
}

export function buildExpandableUserFilterDefinitions(): Array<
  FilterDefinition<DemoUserFilters, keyof DemoUserFilters>
> {
  return [
    NAME_KEYWORD_FILTER,
    DEPARTMENT_FILTER,
    IS_ONLINE_FILTER,
    RISK_SCORE_FILTER,
    CREATED_AT_FILTER,
    LAST_LOGIN_RANGE_FILTER,
  ] as Array<FilterDefinition<DemoUserFilters, keyof DemoUserFilters>>
}

export function buildActiveUserFilterDefinitions(
  filterDefinitions: Array<FilterDefinition<DemoUserFilters, keyof DemoUserFilters>>,
): Array<FilterDefinition<DemoUserFilters, keyof DemoUserFilters>> {
  return [
    {
      key: "q",
      label: "搜索",
      type: "text",
    },
    ...filterDefinitions,
  ]
}
