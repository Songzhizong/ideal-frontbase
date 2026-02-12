import type { DemoUser } from "../types"

const CSV_HEADER_ROW = [
  "ID",
  "姓名",
  "邮箱",
  "手机号",
  "风险分",
  "角色",
  "部门",
  "状态",
  "创建时间",
  "最后登录",
]

function buildCsvCell(value: string): string {
  const normalized = value.replaceAll('"', '""')
  return `"${normalized}"`
}

export function downloadCsvFile(args: { filename: string; rows: string[][] }) {
  const csv = args.rows.map((row) => row.map(buildCsvCell).join(",")).join("\n")
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = args.filename
  link.click()
  URL.revokeObjectURL(url)
}

export function buildUserCsvRows(args: {
  users: DemoUser[]
  roleLabel: (role: DemoUser["role"]) => string
  statusLabel: (status: DemoUser["status"]) => string
}): string[][] {
  return [
    CSV_HEADER_ROW,
    ...args.users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phone,
      String(user.riskScore),
      args.roleLabel(user.role),
      user.department,
      args.statusLabel(user.status),
      user.createdAt,
      user.lastLoginAt,
    ]),
  ]
}
