import { useState } from "react"
import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@/packages/ui"

export function InputOtpControlledDemo() {
  const [value, setValue] = useState("")

  return (
    <div className="grid w-full max-w-md gap-3">
      <InputOTP maxLength={4} value={value} onChange={setValue}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>当前值：{value || "(空)"}</span>
        <Button size="sm" variant="outline" onClick={() => setValue("")}>
          清空
        </Button>
      </div>
    </div>
  )
}

export default InputOtpControlledDemo
