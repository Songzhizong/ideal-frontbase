import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Input } from "@/packages/ui/input"
import type { Api } from "../api/user-management"

const schema = z.object({
  newPassword: z.string().min(8, "密码长度至少 8 位"),
  changeOnFirstLogin: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface UserPasswordDialogProps {
  open: boolean
  user: Api.User.ListUser | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userId: string, values: FormValues) => Promise<void> | void
}

export function UserPasswordDialog({
  open,
  user,
  submitting,
  onOpenChange,
  onSubmit,
}: UserPasswordDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      changeOnFirstLogin: true,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      newPassword: "",
      changeOnFirstLogin: true,
    })
  }, [form, open])

  const handleSubmit = async (values: FormValues) => {
    if (!user) return
    await onSubmit(user.id, values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            为 {user?.name || user?.account || user?.email || "当前用户"} 设置新密码。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      placeholder="请输入新密码"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="changeOnFirstLogin"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">首次登录强制修改密码</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                保存密码
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
