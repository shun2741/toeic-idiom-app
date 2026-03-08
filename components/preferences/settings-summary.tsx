import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SettingItem = {
  label: string;
  value: string;
};

export function SettingsSummary({
  title,
  description,
  items,
  href,
}: {
  title: string;
  description: string;
  items: SettingItem[];
  href: string;
}) {
  return (
    <Card className="animate-fade-up border-border/80 bg-white">
      <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Link href={href}>
          <Button className="w-full md:w-auto" variant="outline">
            設定を変更する
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{item.label}</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
