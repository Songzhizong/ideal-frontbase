import { DownloadIcon, RefreshCwIcon } from "lucide-react"
import qrcode from "qrcode"
import type * as React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"
import { Skeleton } from "./skeleton"

export type QRCodeErrorLevel = "L" | "M" | "Q" | "H"
export type QRCodeStatus = "active" | "loading" | "expired"

export interface QRCodeProps extends React.ComponentProps<"div"> {
  value: string
  size?: number | undefined
  icon?: string | React.ReactNode | undefined
  color?: string | undefined
  backgroundColor?: string | undefined
  errorLevel?: QRCodeErrorLevel | undefined
  status?: QRCodeStatus | undefined
  onRefresh?: (() => void) | undefined
  downloadable?: boolean | undefined
  fileName?: string | undefined
  downloadLabel?: React.ReactNode | undefined
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = fileName
  link.click()
}

export function QRCode({
  value,
  size = 160,
  icon,
  color = "#000000",
  backgroundColor = "#ffffff",
  errorLevel = "M",
  status = "active",
  onRefresh,
  downloadable = true,
  fileName = "qrcode.png",
  downloadLabel = "下载二维码",
  className,
  ...props
}: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState("")
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    let active = true

    const renderQRCode = async () => {
      if (!value) {
        setDataUrl("")
        return
      }

      setRendering(true)
      try {
        const nextDataUrl = await qrcode.toDataURL(value, {
          width: size,
          margin: 1,
          errorCorrectionLevel: errorLevel,
          color: {
            dark: color,
            light: backgroundColor,
          },
        })
        if (!active) {
          return
        }
        setDataUrl(nextDataUrl)
      } catch {
        if (!active) {
          return
        }
        setDataUrl("")
      } finally {
        if (active) {
          setRendering(false)
        }
      }
    }

    void renderQRCode()

    return () => {
      active = false
    }
  }, [backgroundColor, color, errorLevel, size, value])

  const showLoading = status === "loading" || rendering
  const showExpired = status === "expired"

  return (
    <div data-slot="qr-code" className={cn("inline-flex flex-col gap-2", className)} {...props}>
      <div
        className="relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-card"
        style={{ width: size, height: size }}
      >
        {showLoading ? (
          <Skeleton className="h-full w-full rounded-none" />
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="QRCode"
            className={cn("h-full w-full object-contain", showExpired ? "opacity-40" : "")}
          />
        ) : (
          <div className="text-xs text-muted-foreground">二维码生成失败</div>
        )}

        {icon && dataUrl && !showLoading ? (
          <div className="absolute left-1/2 top-1/2 flex size-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-border/50 bg-background p-1">
            {typeof icon === "string" ? (
              <img src={icon} alt="logo" className="h-full w-full object-contain" />
            ) : (
              icon
            )}
          </div>
        ) : null}

        {showExpired ? (
          <div className="absolute inset-0 flex items-center justify-center bg-overlay/35">
            <Button
              type="button"
              size="sm"
              className="cursor-pointer"
              onClick={() => onRefresh?.()}
            >
              <RefreshCwIcon aria-hidden className="size-4" />
              刷新
            </Button>
          </div>
        ) : null}
      </div>

      {downloadable && dataUrl ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => downloadDataUrl(dataUrl, fileName)}
          disabled={showLoading}
        >
          <DownloadIcon aria-hidden className="size-4" />
          {downloadLabel}
        </Button>
      ) : null}
    </div>
  )
}
