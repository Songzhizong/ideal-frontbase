import { zodResolver } from "@hookform/resolvers/zod"
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
import { Textarea } from "@/packages/ui/textarea"
import type { TenantUserRole } from "../types/tenant-users"
import { TENANT_USER_ROLES } from "../types/tenant-users"

const schema = z.object({
  emails: z.string().min(1, "请输入至少一个邮箱"),
  role: z.enum(TENANT_USER_ROLES),
})

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (emails: string[], role: TenantUserRole) => void
  submitting: boolean
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  submitting,
}: InviteUserDialogProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      emails: "",
      role: "Member",
    },
  })

  const handleInvite = (data: z.infer<typeof schema>) => {
    const emailList = data.emails
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    if (emailList.length === 0) {
      form.setError("emails", { message: "请输入有效的邮箱" })
      return
    }

    onConfirm(emailList, data.role)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>邀请用户</DialogTitle>
          <DialogDescription>
            邀请新成员加入租户。您可以一次性输入多个邮箱（以逗号或换行分隔）。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="user1@example.com, user2@example.com"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分配角色</FormLabel>
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
                发送邀请
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
