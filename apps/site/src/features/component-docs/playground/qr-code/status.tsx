import { useState } from "react"
import { Button, QRCode } from "@/packages/ui"

export function QrCodeStatusDemo() {
  const [status, setStatus] = useState<"active" | "loading" | "expired">("expired")
  const [value, setValue] = useState("token-2026-02-16")

  return (
    <div className="space-y-2">
      <QRCode
        value={value}
        status={status}
        downloadable={false}
        onRefresh={() => {
          setStatus("loading")
          window.setTimeout(() => {
            setValue(`token-${Date.now()}`)
            setStatus("active")
          }, 800)
        }}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setStatus("active")}>
          Active
        </Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("loading")}>
          Loading
        </Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("expired")}>
          Expired
        </Button>
      </div>
    </div>
  )
}

export default QrCodeStatusDemo
