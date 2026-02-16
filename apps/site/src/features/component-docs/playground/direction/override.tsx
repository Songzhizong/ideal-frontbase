import { DirectionProvider } from "@/packages/ui"

export function DirectionOverrideDemo() {
  return (
    <DirectionProvider dir="ltr" direction="rtl">
      <div className="grid gap-2 rounded-md border border-border/50 p-3 text-sm">
        <p className="text-muted-foreground">外层传入 dir="ltr"，direction="rtl" 会优先生效。</p>
        <p>مرحبا بكم في لوحة التحكم</p>
      </div>
    </DirectionProvider>
  )
}

export default DirectionOverrideDemo
