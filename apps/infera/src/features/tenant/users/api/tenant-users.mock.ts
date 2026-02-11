import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantInvitationItem,
  TenantUserItem,
  TenantUserRole,
  TenantUserStatus,
} from "../types/tenant-users"
import { TENANT_USER_SEEDS, type TenantUserSeed } from "./tenant-users.mock.seed"

interface TenantUserStoreState {
  users: TenantUserItem[]
  invitations: TenantInvitationItem[]
}

const tenantUserStore = new Map<string, TenantUserStoreState>()
const DEFAULT_SEED = TENANT_USER_SEEDS["1"] as TenantUserSeed

function cloneState(seed: TenantUserSeed): TenantUserStoreState {
  return {
    users: seed.users.map((u) => ({ ...u })),
    invitations: seed.invitations.map((i) => ({ ...i })),
  }
}

function getStoreState(tenantId: string): TenantUserStoreState {
  let state = tenantUserStore.get(tenantId)
  if (!state) {
    const seed = TENANT_USER_SEEDS[tenantId] ?? DEFAULT_SEED
    state = cloneState(seed)
    tenantUserStore.set(tenantId, state)
  }
  return state
}

export const tenantUsersHandlers = [
  // Get Users
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

    const filtered = state.users.filter((u) => {
      if (q && !u.displayName?.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q))
        return false
      if (role && u.role !== role) return false
      if (status && u.status !== status) return false
      return true
    })

    const totalElements = filtered.length
    const totalPages = Math.ceil(totalElements / size)
    const content = filtered.slice((page - 1) * size, page * size)

    return HttpResponse.json({
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content,
    })
  }),

  // Get Invitations
  http.get("*/infera-api/tenants/:tenantId/invitations", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const url = new URL(request.url)

    const q = url.searchParams.get("q")?.toLowerCase() || ""
    const page = Number(url.searchParams.get("pageNumber")) || 1
    const size = Number(url.searchParams.get("pageSize")) || 20

    const filtered = state.invitations.filter((i) => {
      if (q && !i.email.toLowerCase().includes(q)) return false
      return true
    })

    const totalElements = filtered.length
    const totalPages = Math.ceil(totalElements / size)
    const content = filtered.slice((page - 1) * size, page * size)

    return HttpResponse.json({
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content,
    })
  }),

  // Create Invitation
  http.post("*/infera-api/tenants/:tenantId/invitations", async ({ params, request }) => {
    await delay(500)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const { emails, role } = (await request.json()) as { emails: string[]; role: TenantUserRole }

    emails.forEach((email) => {
      state.invitations.unshift({
        id: `inv-${Math.random().toString(36).substr(2, 9)}`,
        email,
        role,
        status: "Pending",
        createdAt: new Date().toISOString(),
      })
    })

    return HttpResponse.json({ success: true })
  }),

  // Update User Role
  http.patch("*/infera-api/tenants/:tenantId/users/:userId/role", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const userId = params.userId as string
    const state = getStoreState(tenantId)
    const { role } = (await request.json()) as { role: TenantUserRole }

    const user = state.users.find((u) => u.id === userId)
    if (user) {
      user.role = role
    }

    return HttpResponse.json({ success: true })
  }),

  // Toggle User Status
  http.patch("*/infera-api/tenants/:tenantId/users/:userId/status", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const userId = params.userId as string
    const state = getStoreState(tenantId)
    const { status } = (await request.json()) as { status: TenantUserStatus }

    const user = state.users.find((u) => u.id === userId)
    if (user) {
      user.status = status
    }

    return HttpResponse.json({ success: true })
  }),

  // Resend Invitation
  http.post("*/infera-api/tenants/:tenantId/invitations/:invId/resend", async () => {
    await delay(300)
    return HttpResponse.json({ success: true })
  }),

  // Delete Invitation
  http.delete("*/infera-api/tenants/:tenantId/invitations/:invId", async ({ params }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const invId = params.invId as string
    const state = getStoreState(tenantId)

    state.invitations = state.invitations.filter((i) => i.id !== invId)

    return new HttpResponse(null, { status: 204 })
  }),
]

mockRegistry.register(...tenantUsersHandlers)
