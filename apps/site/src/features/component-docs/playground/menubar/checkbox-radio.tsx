import { useState } from "react"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/packages/ui"

export function MenubarCheckboxRadioDemo() {
  const [lineNumbers, setLineNumbers] = useState(true)
  const [mode, setMode] = useState("split")

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>视图</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={lineNumbers} onCheckedChange={setLineNumbers}>
            显示行号
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value={mode} onValueChange={setMode}>
            <MenubarRadioItem value="split">分屏模式</MenubarRadioItem>
            <MenubarRadioItem value="single">单栏模式</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export default MenubarCheckboxRadioDemo
