import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { TenantUserItem, TenantUserRole } from "../types/tenant-users"
import { TENANT_USER_ROLES } from "../types/tenant-users"

const schema = z.object({
  role: z.enum(TENANT_USER_ROLES),
})

interface EditRoleDialogProps {
  user: TenantUserItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (role: TenantUserRole) => void
  submitting: boolean
}

export function EditRoleDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  submitting,
}: EditRoleDialogProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: user?.role || "Member",
    },
  })

  useEffect(() => {
    if (user && open) {
      form.reset({ role: user.role })
    }
  }, [user, open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改角色</DialogTitle>
          <DialogDescription>
            为用户 {user?.displayName || user?.email} 分配新的租户角色。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onConfirm(data.role))} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>租户角色</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TENANT_USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="cursor-pointer">
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting} className="cursor-pointer">
                保存记录
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
