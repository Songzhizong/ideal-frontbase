import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createTenantInvitation,
  deleteTenantInvitation,
  resendTenantInvitation,
  toggleTenantUserStatus,
  updateTenantUserRole,
} from "../api"
import type {
  CreateTenantInviteInput,
  DeleteTenantInvitationInput,
  ResendTenantInvitationInput,
  ToggleTenantUserStatusInput,
  UpdateTenantUserRoleInput,
} from "../types/tenant-users"

export function useTenantUserActions(tenantId: string) {
  const queryClient = useQueryClient()

  const inviteMutation = useMutation({
    mutationFn: (input: CreateTenantInviteInput) => createTenantInvitation(input),
    onSuccess: () => {
      toast.success("邀请已发送")
      queryClient.invalidateQueries({ queryKey: ["tenant-invitations", tenantId] })
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: (input: UpdateTenantUserRoleInput) => updateTenantUserRole(input),
    onSuccess: () => {
      toast.success("角色已更新")
      queryClient.invalidateQueries({ queryKey: ["tenant-users", tenantId] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (input: ToggleTenantUserStatusInput) => toggleTenantUserStatus(input),
    onSuccess: () => {
      toast.success("状态已更新")
      queryClient.invalidateQueries({ queryKey: ["tenant-users", tenantId] })
    },
  })

  const resendInvitationMutation = useMutation({
    mutationFn: (input: ResendTenantInvitationInput) => resendTenantInvitation(input),
    onSuccess: () => {
      toast.success("邀请已重发")
    },
  })

  const deleteInvitationMutation = useMutation({
    mutationFn: (input: DeleteTenantInvitationInput) => deleteTenantInvitation(input),
    onSuccess: () => {
      toast.success("邀请已撤销")
      queryClient.invalidateQueries({ queryKey: ["tenant-invitations", tenantId] })
    },
  })

  return {
    invite: inviteMutation,
    updateRole: updateRoleMutation,
    toggleStatus: toggleStatusMutation,
    resendInvitation: resendInvitationMutation,
    deleteInvitation: deleteInvitationMutation,
  }
}
