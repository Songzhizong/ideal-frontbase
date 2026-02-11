import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@/packages/ui/badge"
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
import { Textarea } from "@/packages/ui/textarea"
import type { Api } from "../api/user-management"

const schema = z.object({
  userGroupIdsText: z.string(),
})

type FormValues = z.infer<typeof schema>

function serializeGroupIds(groups: Api.User.UserGroup[]): string {
  return groups.map((group) => group.id).join(",")
}

function parseGroupIds(text: string): string[] {
  return text
    .split(/[\s,]+/u)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

interface UserGroupsDialogProps {
  open: boolean
  user: Api.User.ListUser | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userId: string, userGroupIds: string[]) => Promise<void> | void
}

export function UserGroupsDialog({
  open,
  user,
  submitting,
  onOpenChange,
  onSubmit,
}: UserGroupsDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userGroupIdsText: "",
    },
  })

  useEffect(() => {
    if (!open || !user) return
    form.reset({
      userGroupIdsText: serializeGroupIds(user.userGroups),
    })
  }, [form, open, user])

  const handleSubmit = async (values: FormValues) => {
    if (!user) return
    await onSubmit(user.id, parseGroupIds(values.userGroupIdsText))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>修改用户组</DialogTitle>
          <DialogDescription>请输入用户组 ID（支持英文逗号、空格或换行分隔）。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {user?.userGroups?.length ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">当前用户组</div>
                <div className="flex flex-wrap gap-2">
                  {user.userGroups.map((group) => (
                    <Badge key={group.id} variant="secondary">
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            <FormField
              control={form.control}
              name="userGroupIdsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户组 ID</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[120px] resize-y"
                      placeholder="group-admin,group-dev"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                保存用户组
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
