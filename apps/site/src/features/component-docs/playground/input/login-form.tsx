import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { Button, Input, Label } from "@/packages/ui"

export function InputLoginFormDemo() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="input-login-account">账号</Label>
        <Input id="input-login-account" placeholder="请输入邮箱或手机号" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="input-login-password">密码</Label>
        <div className="relative">
          <Input
            id="input-login-password"
            type={showPassword ? "text" : "password"}
            className="pr-9"
            placeholder="请输入登录密码"
          />
          <Button
            size="xs"
            shape="square"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => {
              setShowPassword((prev) => !prev)
            }}
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? (
              <EyeOffIcon aria-hidden className="size-4" />
            ) : (
              <EyeIcon aria-hidden className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InputLoginFormDemo
