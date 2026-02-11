import type { TenantInvitationItem, TenantUserItem } from "../types/tenant-users"

export interface TenantUserSeed {
  users: TenantUserItem[]
  invitations: TenantInvitationItem[]
}

export const TENANT_USER_SEEDS: Record<string, TenantUserSeed> = {
  "1": {
    users: [
      {
        id: "user-1",
        displayName: "Admin User",
        email: "admin@infera.ai",
        role: "Admin",
        status: "Active",
        lastLoginAt: new Date().toISOString(),
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "user-2",
        displayName: "Member One",
        email: "member1@infera.ai",
        role: "Member",
        status: "Active",
        lastLoginAt: new Date().toISOString(),
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "user-3",
        displayName: "Finance user",
        email: "finance@infera.ai",
        role: "Finance",
        status: "Active",
        lastLoginAt: new Date().toISOString(),
        createdAt: "2024-01-03T00:00:00Z",
      },
      {
        id: "user-4",
        displayName: "Disabled User",
        email: "disabled@infera.ai",
        role: "Member",
        status: "Disabled",
        lastLoginAt: null,
        createdAt: "2024-01-04T00:00:00Z",
      },
    ],
    invitations: [
      {
        id: "inv-1",
        email: "invitee1@example.com",
        role: "Member",
        status: "Pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "inv-2",
        email: "invitee2@example.com",
        role: "Finance",
        status: "Pending",
        createdAt: new Date().toISOString(),
      },
    ],
  },
}
