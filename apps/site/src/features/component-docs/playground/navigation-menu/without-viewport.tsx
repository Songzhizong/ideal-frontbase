import { BaseLink } from "@/packages/platform-router"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/packages/ui"

export function NavigationMenuWithoutViewportDemo() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>导航</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1">
              <li>
                <NavigationMenuLink asChild>
                  <BaseLink to="/design">设计</BaseLink>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <BaseLink to="/engineering">研发</BaseLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default NavigationMenuWithoutViewportDemo
