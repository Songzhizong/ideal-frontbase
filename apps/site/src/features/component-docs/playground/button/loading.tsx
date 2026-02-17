import { useState } from "react"
import { Button, ButtonLoading } from "@/packages/ui"

export function ButtonMdLoadingDemo() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLoading variant="pure" autoLoading loadingDuration={1000}>
          Loading Start
        </ButtonLoading>
        <ButtonLoading
          variant="outline"
          loadingText="Loading..."
          loadingPosition="center"
          autoLoading
          loadingDuration={1000}
        >
          Loading Center
        </ButtonLoading>
        <ButtonLoading variant="soft" loadingPosition="end" autoLoading loadingDuration={1000}>
          Loading End
        </ButtonLoading>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLoading color="accent" loading={loading} onClick={() => setLoading(true)}>
          Controlled Loading
        </ButtonLoading>
        <Button color="destructive" disabled={!loading} onClick={() => setLoading(false)}>
          End Loading
        </Button>
      </div>
    </div>
  )
}

export default ButtonMdLoadingDemo
