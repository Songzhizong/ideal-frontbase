import { BaseLink } from "@/packages/platform-router"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/packages/ui"

export function NavigationMenuBasicTopnavDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <BaseLink to="/">首页</BaseLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>组件</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink asChild>
                  <BaseLink to="/components/button">Button</BaseLink>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <BaseLink to="/components/input">Input</BaseLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default NavigationMenuBasicTopnavDemo
