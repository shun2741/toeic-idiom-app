import { Brain, Flame, RotateCcw, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

const statConfig = [
  {
    key: "todayCount",
    label: "今日の学習数",
    icon: Brain,
    color: "bg-primary/10 text-primary",
    format: (value: number) => `${value} 問`,
  },
  {
    key: "accuracy",
    label: "正答率",
    icon: Target,
    color: "bg-accent text-accent-foreground",
    format: (value: number) => formatPercent(value),
  },
  {
    key: "weakCount",
    label: "苦手問題数",
    icon: RotateCcw,
    color: "bg-warning/15 text-warning",
    format: (value: number) => `${value} 問`,
  },
  {
    key: "currentStreak",
    label: "連続正答",
    icon: Flame,
    color: "bg-rose-100 text-rose-600",
    format: (value: number) => `${value} 回`,
  },
] as const;

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statConfig.map((item, index) => (
        <Card
          key={item.key}
          className="animate-fade-up border-white/80 bg-white/85"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-500">{item.label}</CardTitle>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-950">
              {item.format(stats[item.key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
