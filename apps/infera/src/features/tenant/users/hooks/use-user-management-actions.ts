import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  type Api,
  fetchBlockUser,
  fetchChangeUserGroups,
  fetchCreateUser,
  fetchDeleteUser,
  fetchSetUserPassword,
  fetchUnblockUser,
  fetchUpdateUser,
} from "../api/user-management"

export const USER_MANAGEMENT_QUERY_KEY = "tenant-user-management"

function getListQueryKey(tenantId: string) {
  return [USER_MANAGEMENT_QUERY_KEY, tenantId]
}

export function useUserManagementActions(tenantId: string) {
  const queryClient = useQueryClient()

  const invalidateList = async () => {
    await queryClient.invalidateQueries({ queryKey: getListQueryKey(tenantId) })
  }

  const createUser = useMutation({
    mutationFn: (input: Api.User.CreateUserArgs) => fetchCreateUser(input),
    onSuccess: async () => {
      toast.success("新增用户成功")
      await invalidateList()
    },
  })

  const updateUser = useMutation({
    mutationFn: (args: { userId: string; input: Api.User.UpdateUserArgs }) =>
      fetchUpdateUser(args.userId, args.input),
    onSuccess: async () => {
      toast.success("用户信息已更新")
      await invalidateList()
    },
  })

  const blockUser = useMutation({
    mutationFn: (userId: string) => fetchBlockUser(userId),
    onSuccess: async () => {
      toast.success("用户已锁定")
      await invalidateList()
    },
  })

  const unblockUser = useMutation({
    mutationFn: (userId: string) => fetchUnblockUser(userId),
    onSuccess: async () => {
      toast.success("用户已解锁")
      await invalidateList()
    },
  })

  const setPassword = useMutation({
    mutationFn: (args: { userId: string; newPassword: string; changeOnFirstLogin: boolean }) =>
      fetchSetUserPassword(args.userId, {
        newPassword: args.newPassword,
        changeOnFirstLogin: args.changeOnFirstLogin,
      }),
    onSuccess: () => {
      toast.success("密码已更新")
    },
  })

  const deleteUser = useMutation({
    mutationFn: (userId: string) => fetchDeleteUser(userId),
    onSuccess: async () => {
      toast.success("用户已删除")
      await invalidateList()
    },
  })

  const changeUserGroups = useMutation({
    mutationFn: (args: { userId: string; userGroupIds: string[] }) =>
      fetchChangeUserGroups(args.userId, args.userGroupIds),
    onSuccess: async () => {
      toast.success("用户组已更新")
      await invalidateList()
    },
  })

  return {
    createUser,
    updateUser,
    blockUser,
    unblockUser,
    setPassword,
    deleteUser,
    changeUserGroups,
  }
}
