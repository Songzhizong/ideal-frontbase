import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTenantProject } from "../api/delete-tenant-project"
import type { DeleteTenantProjectInput } from "../types/tenant-projects"

export function useDeleteTenantProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteTenantProjectInput) => deleteTenantProject(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["infera", "tenant-projects", variables.tenantId],
      })
    },
  })
}
