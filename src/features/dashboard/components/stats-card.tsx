import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  accentClass?: string;
};

export function StatsCard({
  title,
  value,
  hint,
  icon: Icon,
  accentClass,
}: StatsCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{hint}</CardDescription>
        </div>
        <div
          className={cn(
            "rounded-2xl border border-border bg-muted/50 p-3 text-foreground shadow-sm",
            accentClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-foreground sm:text-4xl">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
