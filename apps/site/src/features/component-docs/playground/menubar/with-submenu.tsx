import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/packages/ui"

export function MenubarWithSubmenuDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>编辑</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>撤销</MenubarItem>
          <MenubarItem>重做</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>查找与替换</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>查找</MenubarItem>
              <MenubarItem>替换</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export default MenubarWithSubmenuDemo
