import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTenantProject } from "../api/create-tenant-project"
import type { CreateTenantProjectInput } from "../types/tenant-projects"

export function useCreateTenantProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTenantProjectInput) => createTenantProject(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["infera", "tenant-projects", variables.tenantId],
      })
    },
  })
}
