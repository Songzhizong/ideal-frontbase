import { QrCodeIcon } from "lucide-react"
import { QRCode } from "@/packages/ui"

export function QrCodeWithIconDownloadDemo() {
  return (
    <QRCode
      value="https://ideal-frontbase.dev/docs/api-token"
      icon={<QrCodeIcon className="size-5 text-foreground" />}
      size={180}
      fileName="api-token-qrcode.png"
      downloadLabel="下载 Token 二维码"
    />
  )
}

export default QrCodeWithIconDownloadDemo
