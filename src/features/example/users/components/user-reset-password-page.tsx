import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, KeyRound } from "lucide-react"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PageContainer } from "@/components/common/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useBaseNavigate } from "@/hooks/use-base-navigate"
import { getDemoUserById } from "../demo/users"

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "密码至少 8 位").max(64, "密码最多 64 位"),
    confirmPassword: z.string().min(1, "请再次输入密码"),
    forceChangeNextLogin: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>

export function UserResetPasswordPage({ userId }: { userId: string }) {
  const navigate = useBaseNavigate()
  const user = useMemo(() => getDemoUserById(userId), [userId])

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      forceChangeNextLogin: true,
    },
  })

  const handleBackToEdit = useCallback(() => {
    void navigate({ to: `/example/users/${userId}/edit` })
  }, [navigate, userId])

  const handleBackToList = useCallback(() => {
    void navigate({ to: "/example/users" })
  }, [navigate])

  const onSubmit = useCallback(
    (values: ResetPasswordValues) => {
      console.log("Reset password (static):", { userId, ...values })
      void navigate({ to: `/example/users/${userId}/edit` })
    },
    [navigate, userId],
  )

  if (!user) {
    return (
      <PageContainer className="flex flex-col gap-6">
        <section className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold text-foreground">重置密码</h1>
          <Button type="button" variant="outline" className="gap-2" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>用户不存在</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">未找到用户：{userId}</CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">重置密码</h1>
          <p className="text-sm text-muted-foreground">
            静态页面：{user.name}（{user.id}）
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={handleBackToEdit}>
            <ArrowLeft className="h-4 w-4" />
            返回编辑
          </Button>
          <Button type="submit" form="user-reset-password-form" className="gap-2">
            <KeyRound className="h-4 w-4" />
            确认重置
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>设置新密码</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="user-reset-password-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-6 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="至少 8 位"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次输入新密码"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forceChangeNextLogin"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border border-border/50 p-4 md:col-span-2">
                    <div className="space-y-1">
                      <FormLabel>强制下次登录修改密码</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        开启后，用户下次登录需要更新为新密码。
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
