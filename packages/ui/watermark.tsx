import type * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/packages/ui-utils"

export interface WatermarkFont {
  color?: string | undefined
  fontSize?: number | undefined
  fontFamily?: string | undefined
  fontWeight?: number | string | undefined
}

interface ResolvedWatermarkFont {
  color: string
  fontSize: number
  fontFamily: string
  fontWeight: number | string
}

export interface WatermarkProps extends Omit<React.ComponentProps<"div">, "content"> {
  content?: string | string[] | undefined
  image?: string | undefined
  rotate?: number | undefined
  gap?: [number, number] | undefined
  offset?: [number, number] | undefined
  opacity?: number | undefined
  font?: WatermarkFont | undefined
  zIndex?: number | undefined
  observe?: boolean | undefined
}

async function buildWatermarkDataUrl({
  content,
  image,
  rotate,
  gap,
  offset,
  opacity,
  font,
}: {
  content: string | string[]
  image?: string | undefined
  rotate: number
  gap: [number, number]
  offset: [number, number]
  opacity: number
  font: ResolvedWatermarkFont
}) {
  const canvas = document.createElement("canvas")
  canvas.width = gap[0]
  canvas.height = gap[1]

  const context = canvas.getContext("2d")
  if (!context) {
    return ""
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.globalAlpha = opacity
  context.translate(canvas.width / 2 + offset[0], canvas.height / 2 + offset[1])
  context.rotate((Math.PI / 180) * rotate)

  if (image) {
    const watermarkImage = new Image()
    watermarkImage.crossOrigin = "anonymous"

    const loaded = await new Promise<boolean>((resolve) => {
      watermarkImage.onload = () => resolve(true)
      watermarkImage.onerror = () => resolve(false)
      watermarkImage.src = image
    })

    if (loaded) {
      const maxWidth = canvas.width * 0.62
      const maxHeight = canvas.height * 0.62
      const ratio = Math.min(maxWidth / watermarkImage.width, maxHeight / watermarkImage.height, 1)
      const drawWidth = watermarkImage.width * ratio
      const drawHeight = watermarkImage.height * ratio
      context.drawImage(watermarkImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
      return canvas.toDataURL("image/png")
    }
  }

  const lines = Array.isArray(content) ? content : content.split("\n")
  const lineHeight = font.fontSize * 1.4

  context.fillStyle = font.color
  context.font = `${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`
  context.textAlign = "center"
  context.textBaseline = "middle"

  const startY = -((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, index) => {
    context.fillText(line, 0, startY + index * lineHeight)
  })

  return canvas.toDataURL("image/png")
}

export function Watermark({
  content = "CONFIDENTIAL",
  image,
  rotate = -20,
  gap = [160, 128],
  offset = [0, 0],
  opacity = 0.15,
  font,
  zIndex = 20,
  observe = true,
  className,
  children,
  style,
  ...props
}: WatermarkProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [dataUrl, setDataUrl] = useState("")

  const resolvedFont = useMemo<ResolvedWatermarkFont>(
    () => ({
      color: font?.color ?? "hsl(var(--foreground) / 0.45)",
      fontSize: font?.fontSize ?? 14,
      fontFamily: font?.fontFamily ?? "ui-sans-serif, system-ui, sans-serif",
      fontWeight: font?.fontWeight ?? 500,
    }),
    [font?.color, font?.fontFamily, font?.fontSize, font?.fontWeight],
  )

  useEffect(() => {
    let active = true

    void buildWatermarkDataUrl({
      content,
      image,
      rotate,
      gap,
      offset,
      opacity,
      font: resolvedFont,
    }).then((nextDataUrl) => {
      if (!active) {
        return
      }
      setDataUrl(nextDataUrl)
    })

    return () => {
      active = false
    }
  }, [content, image, rotate, gap, offset, opacity, resolvedFont])

  useEffect(() => {
    const host = hostRef.current
    const overlay = overlayRef.current
    if (!host || !overlay) {
      return
    }

    const syncOverlay = () => {
      const container = hostRef.current
      const watermarkLayer = overlayRef.current
      if (!container || !watermarkLayer) {
        return
      }

      if (!container.contains(watermarkLayer)) {
        container.appendChild(watermarkLayer)
      }

      if (container.style.position.length === 0 || container.style.position === "static") {
        container.style.position = "relative"
      }

      watermarkLayer.style.position = "absolute"
      watermarkLayer.style.inset = "0"
      watermarkLayer.style.pointerEvents = "none"
      watermarkLayer.style.zIndex = String(zIndex)
      watermarkLayer.style.backgroundRepeat = "repeat"
      watermarkLayer.style.backgroundPosition = `${offset[0]}px ${offset[1]}px`
      watermarkLayer.style.backgroundSize = `${gap[0]}px ${gap[1]}px`
      watermarkLayer.style.backgroundImage = dataUrl ? `url(${dataUrl})` : "none"
    }

    syncOverlay()
    if (!observe) {
      return
    }

    const hostObserver = new MutationObserver(() => {
      syncOverlay()
    })
    hostObserver.observe(host, {
      attributes: true,
      attributeFilter: ["style", "class"],
      childList: true,
    })

    const overlayObserver = new MutationObserver(() => {
      syncOverlay()
    })
    overlayObserver.observe(overlay, {
      attributes: true,
      attributeFilter: ["style", "class"],
    })

    return () => {
      hostObserver.disconnect()
      overlayObserver.disconnect()
    }
  }, [dataUrl, gap, observe, offset, zIndex])

  return (
    <div
      ref={hostRef}
      data-slot="watermark"
      className={cn("relative", className)}
      style={style}
      {...props}
    >
      {children}
      <div ref={overlayRef} aria-hidden />
    </div>
  )
}
