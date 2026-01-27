import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn("sheet-overlay fixed inset-0 z-50", className)}
		{...props}
	/>
))

SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const sheetVariants = cva(
	"sheet-content fixed z-50 flex flex-col bg-popover shadow-2xl rounded-2xl border border-border/60 overflow-hidden",
	{
		variants: {
			side: {
				left: "inset-y-5 left-5 w-72",
				right: "inset-y-5 right-5 w-72",
				top: "inset-x-5 top-5 h-auto",
				bottom: "inset-x-5 bottom-5 h-auto",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
)

interface SheetContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
		VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Content>,
	SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
	<SheetPortal>
		<SheetOverlay />
		<DialogPrimitive.Content
			ref={ref}
			data-side={side}
			className={cn(sheetVariants({ side }), className)}
			{...props}
		>
			{children}
			<DialogPrimitive.Close className="absolute right-5 top-4 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary bg-background/50 backdrop-blur-sm p-1.5 hover:bg-background/80">
				<X className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</SheetPortal>
))

SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
		{...props}
	/>
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold text-foreground", className)}
		{...props}
	/>
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
))
SheetDescription.displayName = DialogPrimitive.Description.displayName

export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
}
