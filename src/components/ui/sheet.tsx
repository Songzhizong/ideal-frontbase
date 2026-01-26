import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
));

SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 flex h-full flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
  {
    variants: {
      side: {
        left:
          "inset-y-0 left-0 w-72 -translate-x-full data-[state=open]:translate-x-0",
        right:
          "inset-y-0 right-0 w-72 translate-x-full data-[state=open]:translate-x-0",
        top: "inset-x-0 top-0 h-auto -translate-y-full data-[state=open]:translate-y-0",
        bottom:
          "inset-x-0 bottom-0 h-auto translate-y-full data-[state=open]:translate-y-0",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    />
  </SheetPortal>
));

SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetPortal, SheetTrigger };
