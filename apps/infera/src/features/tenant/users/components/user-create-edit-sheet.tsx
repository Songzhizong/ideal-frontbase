import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { Button } from "@/packages/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Input } from "@/packages/ui/input"
import { Sheet, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/packages/ui/sheet"
import type { Api } from "../api/user-management"

const schema = z.object({
  name: z.string().trim().min(1, "请输入用户姓名"),
  account: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /\S+@\S+\.\S+/.test(value), "请输入合法邮箱"),
  password: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function toOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

interface UserCreateEditSheetProps {
  open: boolean
  mode: "create" | "edit"
  user: Api.User.ListUser | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: Api.User.CreateUserArgs) => Promise<void> | void
  onUpdate: (userId: string, values: Api.User.UpdateUserArgs) => Promise<void> | void
}

export function UserCreateEditSheet({
  open,
  mode,
  user,
  submitting,
  onOpenChange,
  onCreate,
  onUpdate,
}: UserCreateEditSheetProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      account: "",
      phone: "",
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && user) {
      form.reset({
        name: user.name,
        account: user.account ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        password: "",
      })
      return
    }
    form.reset({
      name: "",
      account: "",
      phone: "",
      email: "",
      password: "",
    })
  }, [form, mode, open, user])

  const handleSubmit = async (values: FormValues) => {
    if (mode === "edit" && user) {
      const updatePayload: Api.User.UpdateUserArgs = {}
      const name = toOptional(values.name)
      const phone = toOptional(values.phone)
      const email = toOptional(values.email)
      if (name) updatePayload.name = name
      if (phone) updatePayload.phone = phone
      if (email) updatePayload.email = email

      await onUpdate(user.id, {
        ...updatePayload,
      })
      onOpenChange(false)
      return
    }

    const createPayload: Api.User.CreateUserArgs = {
      name: values.name.trim(),
    }
    const account = toOptional(values.account)
    const phone = toOptional(values.phone)
    const email = toOptional(values.email)
    const password = toOptional(values.password)
    if (account) createPayload.account = account
    if (phone) createPayload.phone = phone
    if (email) createPayload.email = email
    if (password) createPayload.password = password

    await onCreate({
      ...createPayload,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="w-[560px] max-w-[96vw] p-0 sm:max-w-[560px]">
        <SheetHeader className="border-b border-border/50 px-6 py-5">
          <SheetTitle>{mode === "create" ? "新增用户" : "编辑用户"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "填写用户基础信息并创建账号。"
              : "更新用户基础信息，保存后即时生效。"}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户姓名</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入用户姓名" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === "create" ? (
                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>账号</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="请输入账号（不包含 @ 后缀）" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入手机号" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入邮箱" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === "create" ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>初始密码</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="new-password"
                          placeholder="可选"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
            <SheetFooter className="border-t border-border/50 px-6 py-4">
              <div className="flex w-full justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {mode === "create" ? "创建用户" : "保存修改"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </AppSheetContent>
    </Sheet>
  )
}
