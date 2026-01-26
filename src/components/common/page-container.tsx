import { cn } from "@/lib/utils";
import type * as React from "react";

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-12",
        className,
      )}
      {...props}
    />
  );
}
