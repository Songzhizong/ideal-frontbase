import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import type { User } from "@/features/core/users/types"
import { mockRegistry } from "@/mocks/registry"

// 生成 50 个 mock 用户
const allMockUsers: User[] = Array.from({ length: 50 }).map((_, index) => {
  const id = (index + 1).toString()
  const usernames = ["张伟", "李娜", "王强", "刘芳", "陈明", "杨静", "赵磊", "黄丽", "周涛", "吴敏"]
  const groups = ["admin", "user", "guest", "developer", "analyst", "support"]
  const statuses = ["active", "inactive"] as const

  return {
    id,
    username: `${usernames[index % usernames.length]}${Math.floor(index / usernames.length) || ""}`,
    email: `user${id}@company.com`,
    phone: `13${Math.floor(Math.random() * 10)}****${1000 + index}`,
    userGroups: [groups[index % groups.length], groups[(index + 2) % groups.length]].filter(
      (v): v is string => true,
    ),
    status: statuses[index % 2],
    mfaEnabled: index % 3 === 0,
    lastVisit: addMinutes(new Date(), -Math.floor(Math.random() * 10000)).toISOString(),
  } as User
})

export const userHandlers = [
  http.get("*/users", async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const pageNumber = Number.parseInt(url.searchParams.get("pageNumber") || "1", 10)
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10", 10)
    const username = url.searchParams.get("username")
    const status = url.searchParams.get("status")
    const mfaEnabled = url.searchParams.get("mfaEnabled")
    const email = url.searchParams.get("email")
    const phone = url.searchParams.get("phone")
    const userGroups = url.searchParams.get("userGroups")
    const sortField = url.searchParams.get("sortField")
    const sortOrder = url.searchParams.get("sortOrder")

    let filteredUsers = [...allMockUsers]

    // 过滤逻辑
    if (username) {
      filteredUsers = filteredUsers.filter((u) => u.username.includes(username))
    }
    if (status && status !== "all") {
      filteredUsers = filteredUsers.filter((u) => u.status === status)
    }
    if (mfaEnabled && mfaEnabled !== "all") {
      const isMfaEnabled = mfaEnabled === "true"
      filteredUsers = filteredUsers.filter((u) => u.mfaEnabled === isMfaEnabled)
    }
    if (email) {
      filteredUsers = filteredUsers.filter((u) => u.email.includes(email))
    }
    if (phone) {
      filteredUsers = filteredUsers.filter((u) => u.phone.includes(phone))
    }
    if (userGroups && userGroups !== "all") {
      filteredUsers = filteredUsers.filter((u) => u.userGroups.includes(userGroups))
    }

    // 排序逻辑
    if (sortField && sortOrder) {
      filteredUsers.sort((a, b) => {
        const aValue = a[sortField as keyof User]
        const bValue = b[sortField as keyof User]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        return 0
      })
    }

    const totalElements = filteredUsers.length
    const totalPages = Math.ceil(totalElements / pageSize)
    const content = filteredUsers.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)

    return HttpResponse.json({
      content,
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
    })
  }),
]

// 主动注入
mockRegistry.register(...userHandlers)
