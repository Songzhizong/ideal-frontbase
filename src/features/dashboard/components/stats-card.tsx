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
          <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
          <CardDescription>{hint}</CardDescription>
        </div>
        <div
          className={cn(
            "rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm",
            accentClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
