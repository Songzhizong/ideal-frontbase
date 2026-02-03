"use client"

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import type * as React from "react"
import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

function ContextMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
	inset?: boolean
}) {
	return (
		<ContextMenuPrimitive.SubTrigger
			className={cn(
				"flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
				inset && "pl-8",
				className,
			)}
			{...props}
		>
			{children}
		</ContextMenuPrimitive.SubTrigger>
	)
}

function ContextMenuSubContent({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>) {
	return (
		<ContextMenuPrimitive.SubContent
			className={cn(
				"dropdown-content z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg",
				className,
			)}
			{...props}
		/>
	)
}

function ContextMenuContent({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				className={cn(
					"dropdown-content z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
					className,
				)}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	)
}

function ContextMenuItem({
	className,
	inset,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
	inset?: boolean
}) {
	return (
		<ContextMenuPrimitive.Item
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	)
}

function ContextMenuCheckboxItem({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>) {
	return (
		<ContextMenuPrimitive.CheckboxItem
			className={cn(
				"relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	)
}

function ContextMenuRadioItem({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>) {
	return (
		<ContextMenuPrimitive.RadioItem
			className={cn(
				"relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	)
}

function ContextMenuLabel({
	className,
	inset,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
	inset?: boolean
}) {
	return (
		<ContextMenuPrimitive.Label
			className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
			{...props}
		/>
	)
}

function ContextMenuSeparator({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>) {
	return (
		<ContextMenuPrimitive.Separator
			className={cn("-mx-1 my-1 h-px bg-muted", className)}
			{...props}
		/>
	)
}

function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuRadioGroup,
}
