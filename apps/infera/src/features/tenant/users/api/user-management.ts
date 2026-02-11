import { api } from "@/features/core/api/http-client"
import type { PageInfo } from "@/packages/shared-types"
import { encryptPayloadRSA_AES } from "./encryption"

export namespace Api {
  export namespace User {
    export interface UserGroup {
      id: string
      name: string
      note?: string | null
    }

    /** user */
    export interface ListUser {
      id: string
      containerId: string
      name: string
      account?: string
      fullAccount?: string
      phone?: string
      email?: string
      realNameVerified: boolean
      mfaEnabled: boolean
      blocked: boolean
      createdTime: number
      lastActiveTime?: number
      userGroups: UserGroup[]
    }

    export interface ShareUser {
      id: string
      name: string
      account?: string
      fullAccount?: string
      phone?: string
      email?: string
      tenantId: string
      tenantName: string
      tenantAbbreviation: string
    }

    export interface UserDetail {
      id: string
      containerId: string
      name: string
      account?: string
      fullAccount?: string
      phone?: string
      email?: string
      realNameVerified: boolean
      mfaEnabled: boolean
      blocked: boolean
      createdTime: number
    }

    /** Create user args (frontend) */
    export interface CreateUserArgs {
      /** 用户姓名 @required */
      name: string
      /** 账号(不包含@后缀) */
      account?: string
      /** 手机号 */
      phone?: string
      /** 邮箱 */
      email?: string
      /** 密码 */
      password?: string
    }

    /** Update user args */
    export interface UpdateUserArgs {
      /** 用户姓名 */
      name?: string
      /** 手机号 */
      phone?: string
      /** 邮箱 */
      email?: string
    }

    export interface UserSearchParams {
      pageNumber?: number | null
      pageSize?: number | null
      ids?: string[] | null
      keyword?: string | null
      name?: string | null
      account?: string | null
      phone?: string | null
      email?: string | null
      blocked?: string | null
      mfaEnabled?: string | null
    }

    /** user list */
    export type UserList = PageInfo<ListUser>
  }
}

function normalizeQueryParams(params?: Api.User.UserSearchParams) {
  const normalized = new URLSearchParams()
  if (!params) return normalized

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.length > 0) {
          normalized.append(key, item)
        }
      }
      continue
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      normalized.append(key, String(value))
    }
  }

  return normalized
}

/** get user list */
export function fetchGetUserList(params?: Api.User.UserSearchParams) {
  return api
    .withTenantId()
    .get("nexus-api/iam/tenant/users", {
      searchParams: normalizeQueryParams(params),
    })
    .json<Api.User.UserList>()
}

/** create user */
export function fetchCreateUser(data: Api.User.CreateUserArgs) {
  return api
    .withTenantId()
    .post("nexus-api/iam/tenant/users", { json: data })
    .json<Api.User.UserDetail>()
}

/** get user detail (unmask) */
export function fetchGetUserUnmask(userId: string | number) {
  return api
    .withTenantId()
    .get(`nexus-api/iam/tenant/users/${encodeURIComponent(String(userId))}/unmask`)
    .json<Api.User.UserDetail>()
}

/** update user */
export async function fetchUpdateUser(userId: string | number, data: Api.User.UpdateUserArgs) {
  await api
    .withTenantId()
    .put(`nexus-api/iam/tenant/users/${encodeURIComponent(String(userId))}/update`, {
      json: data,
    })
}

/** lock user */
export async function fetchBlockUser(userId: string | number) {
  await api
    .withTenantId()
    .patch(`nexus-api/iam/tenant/users/${encodeURIComponent(String(userId))}/block`)
}

/** unlock user */
export async function fetchUnblockUser(userId: string | number) {
  await api
    .withTenantId()
    .patch(`nexus-api/iam/tenant/users/${encodeURIComponent(String(userId))}/unblock`)
}

/** set user password */
export async function fetchSetUserPassword(
  userId: string | number,
  data: {
    newPassword: string
    changeOnFirstLogin: boolean
  },
) {
  const encrypted = await encryptPayloadRSA_AES(data)
  const endpoint = `nexus-api/iam/tenant/users/${encodeURIComponent(String(userId))}/set-password`

  if (encrypted) {
    await api.withTenantId().post(endpoint, {
      headers: {
        ...encrypted.headers,
      },
      json: encrypted.body,
    })
    return
  }

  await api.withTenantId().post(endpoint, {
    json: data,
  })
}

export function fetchGetUserByShareCode(shareCode: string) {
  return api
    .withTenantId()
    .get(`nexus-api/iam/users/share-code/${encodeURIComponent(shareCode)}`)
    .json<Api.User.ShareUser>()
}

/** delete user */
export async function fetchDeleteUser(userId: string | number) {
  await api
    .withTenantId()
    .delete(`nexus-api/iam/tenant/users/${encodeURIComponent(String(userId))}`)
}

export async function fetchChangeUserGroups(userId: string, userGroupIds: string[]) {
  await api
    .withTenantId()
    .patch(`nexus-api/iam/tenant/users/${encodeURIComponent(userId)}/groups`, {
      json: {
        userGroupIds,
      },
    })
}
