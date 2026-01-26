import { cn } from "@/lib/utils";
import type * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.15)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn("text-xl font-semibold text-slate-900", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("mt-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn("mt-6 flex items-center gap-2", className)} {...props} />
  );
}
