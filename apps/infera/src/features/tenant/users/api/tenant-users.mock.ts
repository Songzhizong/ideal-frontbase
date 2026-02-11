import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantInvitationItem,
  TenantUserItem,
  TenantUserRole,
  TenantUserStatus,
} from "../types/tenant-users"
import { TENANT_USER_SEEDS, type TenantUserSeed } from "./tenant-users.mock.seed"

interface MockUserGroup {
  id: string
  name: string
  note?: string | null
}

interface TenantUserMockItem extends TenantUserItem {
  containerId: string
  name: string
  account?: string
  fullAccount?: string
  phone?: string
  realNameVerified: boolean
  mfaEnabled: boolean
  blocked: boolean
  createdTime: number
  lastActiveTime?: number
  userGroups: MockUserGroup[]
}

interface TenantUserStoreState {
  users: TenantUserMockItem[]
  invitations: TenantInvitationItem[]
}

const ROLE_GROUPS: Record<TenantUserRole, MockUserGroup[]> = {
  Admin: [
    { id: "group-admin", name: "管理员" },
    { id: "group-sec", name: "安全审计" },
  ],
  Member: [{ id: "group-rd", name: "研发" }],
  Finance: [
    { id: "group-finance", name: "财务" },
    { id: "group-approval", name: "审批" },
    { id: "group-risk", name: "风控" },
  ],
}

const tenantUserStore = new Map<string, TenantUserStoreState>()
const DEFAULT_SEED = TENANT_USER_SEEDS["1"] as TenantUserSeed

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function deriveGroups(user: TenantUserItem, index: number): MockUserGroup[] {
  const roleGroups = ROLE_GROUPS[user.role]
  if (roleGroups.length <= 1) {
    return roleGroups.map((group) => ({ ...group }))
  }
  if (index % 2 === 0) {
    return roleGroups.map((group) => ({ ...group }))
  }
  return [roleGroups[0] as MockUserGroup]
}

function toMockUser(user: TenantUserItem, tenantId: string, index: number): TenantUserMockItem {
  const createdTime = Date.parse(user.createdAt) || Date.now()
  const lastActiveTime = user.lastLoginAt ? Date.parse(user.lastLoginAt) : undefined
  const account = user.email.split("@")[0] ?? user.email
  const blocked = user.status === "Disabled"
  return {
    ...user,
    containerId: tenantId,
    name: user.displayName || account,
    account,
    fullAccount: user.email,
    ...(index % 2 === 0 ? { phone: `1380000${String(1000 + index)}` } : {}),
    realNameVerified: index % 3 !== 0,
    mfaEnabled: index % 2 === 0,
    blocked,
    createdTime,
    ...(lastActiveTime !== undefined ? { lastActiveTime } : {}),
    userGroups: deriveGroups(user, index),
  }
}

function cloneState(seed: TenantUserSeed, tenantId: string): TenantUserStoreState {
  return {
    users: seed.users.map((user, index) => toMockUser(user, tenantId, index)),
    invitations: seed.invitations.map((invitation) => ({ ...invitation })),
  }
}

function getTenantIdFromRequest(request: Request, fallback = "1") {
  const fromHeader = request.headers.get("x-tenant-id")
  if (fromHeader && fromHeader.trim().length > 0) {
    return fromHeader.trim()
  }
  return fallback
}

function getStoreState(tenantId: string): TenantUserStoreState {
  let state = tenantUserStore.get(tenantId)
  if (!state) {
    const seed = TENANT_USER_SEEDS[tenantId] ?? DEFAULT_SEED
    state = cloneState(seed, tenantId)
    tenantUserStore.set(tenantId, state)
  }
  return state
}

function toLegacyUser(user: TenantUserMockItem): TenantUserItem {
  return {
    id: user.id,
    displayName: user.name,
    email: user.email || user.fullAccount || `${user.account || "user"}@infera.ai`,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastActiveTime ? new Date(user.lastActiveTime).toISOString() : null,
    createdAt: new Date(user.createdTime).toISOString(),
  }
}

function toManagedUser(user: TenantUserMockItem) {
  return {
    id: user.id,
    containerId: user.containerId,
    name: user.name,
    account: user.account,
    fullAccount: user.fullAccount,
    phone: user.phone,
    email: user.email,
    realNameVerified: user.realNameVerified,
    mfaEnabled: user.mfaEnabled,
    blocked: user.blocked,
    createdTime: user.createdTime,
    lastActiveTime: user.lastActiveTime,
    userGroups: user.userGroups.map((group) => ({ ...group })),
  }
}

function findUser(state: TenantUserStoreState, userId: string) {
  return state.users.find((user) => user.id === userId)
}

export const tenantUsersHandlers = [
  // V1 - Get Users
  http.get("*/infera-api/tenants/:tenantId/users", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const url = new URL(request.url)

    const q = url.searchParams.get("q")?.toLowerCase() || ""
    const role = url.searchParams.get("role") as TenantUserRole | null
    const status = url.searchParams.get("status") as TenantUserStatus | null
    const page = Number(url.searchParams.get("pageNumber")) || 1
    const size = Number(url.searchParams.get("pageSize")) || 20

    const filtered = state.users.filter((user) => {
      const email = user.email || ""
      if (q && !user.name.toLowerCase().includes(q) && !email.toLowerCase().includes(q))
        return false
      if (role && user.role !== role) return false
      if (status && user.status !== status) return false
      return true
    })

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const content = filtered.slice((page - 1) * size, page * size).map(toLegacyUser)

    return HttpResponse.json({
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content,
    })
  }),

  // V1 - Get Invitations
  http.get("*/infera-api/tenants/:tenantId/invitations", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const url = new URL(request.url)

    const q = url.searchParams.get("q")?.toLowerCase() || ""
    const page = Number(url.searchParams.get("pageNumber")) || 1
    const size = Number(url.searchParams.get("pageSize")) || 20

    const filtered = state.invitations.filter((invitation) => {
      if (q && !invitation.email.toLowerCase().includes(q)) return false
      return true
    })

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const content = filtered.slice((page - 1) * size, page * size)

    return HttpResponse.json({
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content,
    })
  }),

  // V1 - Create Invitation
  http.post("*/infera-api/tenants/:tenantId/invitations", async ({ params, request }) => {
    await delay(500)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const body = (await request.json()) as {
      emails?: string[]
      role?: TenantUserRole
    }
    const emails = Array.isArray(body.emails) ? body.emails : []
    const role = body.role ?? "Member"

    for (const email of emails) {
      state.invitations.unshift({
        id: randomId("inv"),
        email,
        role,
        status: "Pending",
        createdAt: new Date().toISOString(),
      })
    }

    return HttpResponse.json({ success: true })
  }),

  // V1 - Update User Role
  http.patch("*/infera-api/tenants/:tenantId/users/:userId/role", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const userId = params.userId as string
    const state = getStoreState(tenantId)
    const body = (await request.json()) as { role?: TenantUserRole }
    const user = findUser(state, userId)
    if (user && body.role) {
      user.role = body.role
      user.userGroups = ROLE_GROUPS[body.role].map((group) => ({ ...group }))
    }

    return HttpResponse.json({ success: true })
  }),

  // V1 - Toggle User Status
  http.patch("*/infera-api/tenants/:tenantId/users/:userId/status", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const userId = params.userId as string
    const state = getStoreState(tenantId)
    const body = (await request.json()) as { status?: TenantUserStatus }
    const user = findUser(state, userId)
    if (user && body.status) {
      user.status = body.status
      user.blocked = body.status === "Disabled"
    }

    return HttpResponse.json({ success: true })
  }),

  // V1 - Resend Invitation
  http.post("*/infera-api/tenants/:tenantId/invitations/:invId/resend", async () => {
    await delay(300)
    return HttpResponse.json({ success: true })
  }),

  // V1 - Delete Invitation
  http.delete("*/infera-api/tenants/:tenantId/invitations/:invId", async ({ params }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const invId = params.invId as string
    const state = getStoreState(tenantId)

    state.invitations = state.invitations.filter((invitation) => invitation.id !== invId)
    return new HttpResponse(null, { status: 204 })
  }),

  // V2 - List users
  http.get("*/nexus-api/iam/tenant/users", async ({ request }) => {
    await delay(320)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const url = new URL(request.url)
    const keyword = url.searchParams.get("keyword")?.trim().toLowerCase() || ""
    const blocked = url.searchParams.get("blocked")
    const mfaEnabled = url.searchParams.get("mfaEnabled")
    const page = Number(url.searchParams.get("pageNumber")) || 1
    const size = Number(url.searchParams.get("pageSize")) || 20

    const filtered = state.users.filter((user) => {
      if (blocked === "true" && !user.blocked) return false
      if (blocked === "false" && user.blocked) return false
      if (mfaEnabled === "true" && !user.mfaEnabled) return false
      if (mfaEnabled === "false" && user.mfaEnabled) return false
      if (!keyword) return true

      const haystack = [user.name, user.account, user.phone, user.email, user.fullAccount]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const content = filtered.slice((page - 1) * size, page * size).map(toManagedUser)

    return HttpResponse.json({
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content,
    })
  }),

  // V2 - Create user
  http.post("*/nexus-api/iam/tenant/users", async ({ request }) => {
    await delay(450)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const body = (await request.json()) as {
      name?: string
      account?: string
      phone?: string
      email?: string
      password?: string
    }
    const now = Date.now()
    const account = body.account?.trim() || `user${state.users.length + 1}`
    const email = body.email?.trim() || `${account}@infera.ai`
    const created: TenantUserMockItem = {
      id: randomId("user"),
      containerId: tenantId,
      name: body.name?.trim() || account,
      displayName: body.name?.trim() || account,
      email,
      account,
      fullAccount: email,
      realNameVerified: false,
      mfaEnabled: false,
      blocked: false,
      createdTime: now,
      createdAt: new Date(now).toISOString(),
      lastLoginAt: null,
      role: "Member",
      status: "Active",
      userGroups: [{ id: "group-rd", name: "研发" }],
      ...(body.phone?.trim() ? { phone: body.phone.trim() } : {}),
    }

    state.users.unshift(created)

    return HttpResponse.json({
      id: created.id,
      containerId: created.containerId,
      name: created.name,
      account: created.account,
      fullAccount: created.fullAccount,
      phone: created.phone,
      email: created.email,
      realNameVerified: created.realNameVerified,
      mfaEnabled: created.mfaEnabled,
      blocked: created.blocked,
      createdTime: created.createdTime,
    })
  }),

  // V2 - Get unmasked detail
  http.get("*/nexus-api/iam/tenant/users/:userId/unmask", async ({ params, request }) => {
    await delay(260)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const userId = params.userId as string
    const user = findUser(state, userId)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      id: user.id,
      containerId: user.containerId,
      name: user.name,
      account: user.account,
      fullAccount: user.fullAccount,
      phone: user.phone,
      email: user.email,
      realNameVerified: user.realNameVerified,
      mfaEnabled: user.mfaEnabled,
      blocked: user.blocked,
      createdTime: user.createdTime,
    })
  }),

  // V2 - Update user
  http.put("*/nexus-api/iam/tenant/users/:userId/update", async ({ params, request }) => {
    await delay(300)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const userId = params.userId as string
    const user = findUser(state, userId)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = (await request.json()) as {
      name?: string
      phone?: string
      email?: string
    }

    if (typeof body.name === "string" && body.name.trim()) {
      user.name = body.name.trim()
      user.displayName = body.name.trim()
    }
    if (typeof body.phone === "string") {
      const nextPhone = body.phone.trim()
      if (nextPhone) {
        user.phone = nextPhone
      } else {
        delete user.phone
      }
    }
    if (typeof body.email === "string") {
      const nextEmail = body.email.trim()
      if (nextEmail) {
        user.email = nextEmail
        user.fullAccount = nextEmail
      }
    }

    return HttpResponse.json({ success: true })
  }),

  // V2 - Block user
  http.patch("*/nexus-api/iam/tenant/users/:userId/block", async ({ params, request }) => {
    await delay(220)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const user = findUser(state, params.userId as string)
    if (user) {
      user.blocked = true
      user.status = "Disabled"
    }
    return HttpResponse.json({ success: true })
  }),

  // V2 - Unblock user
  http.patch("*/nexus-api/iam/tenant/users/:userId/unblock", async ({ params, request }) => {
    await delay(220)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const user = findUser(state, params.userId as string)
    if (user) {
      user.blocked = false
      user.status = "Active"
    }
    return HttpResponse.json({ success: true })
  }),

  // V2 - Set password
  http.post("*/nexus-api/iam/tenant/users/:userId/set-password", async () => {
    await delay(260)
    return HttpResponse.json({ success: true })
  }),

  // V2 - Delete user
  http.delete("*/nexus-api/iam/tenant/users/:userId", async ({ params, request }) => {
    await delay(260)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const userId = params.userId as string
    state.users = state.users.filter((user) => user.id !== userId)
    return new HttpResponse(null, { status: 204 })
  }),

  // V2 - Change user groups
  http.patch("*/nexus-api/iam/tenant/users/:userId/groups", async ({ params, request }) => {
    await delay(260)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const user = findUser(state, params.userId as string)
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = (await request.json()) as { userGroupIds?: string[] }
    const ids = Array.isArray(body.userGroupIds) ? body.userGroupIds : []
    user.userGroups = ids.map((id) => ({
      id,
      name: id.startsWith("group-") ? id.replace("group-", "").toUpperCase() : `分组 ${id}`,
    }))

    return HttpResponse.json({ success: true })
  }),

  // V2 - User by share code
  http.get("*/nexus-api/iam/users/share-code/:shareCode", async ({ params, request }) => {
    await delay(200)
    const tenantId = getTenantIdFromRequest(request)
    const state = getStoreState(tenantId)
    const user = state.users[0]
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      id: user.id,
      name: user.name,
      account: user.account,
      fullAccount: user.fullAccount,
      phone: user.phone,
      email: user.email,
      tenantId,
      tenantName: `租户-${tenantId}`,
      tenantAbbreviation: `T${tenantId}`,
      shareCode: params.shareCode,
    })
  }),
]

mockRegistry.register(...tenantUsersHandlers)
