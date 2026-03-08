import { ChevronDown, SlidersHorizontal } from "lucide-react";

type SettingItem = {
  label: string;
  value: string;
};

export function SettingsSummary({
  title,
  description,
  items,
  children,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  items: SettingItem[];
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group animate-fade-up overflow-hidden rounded-3xl border border-border/80 bg-white"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-4 px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            {title}
          </p>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          ここから設定を変更
          <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="grid gap-3 border-t border-border px-6 py-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{item.label}</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>
      {children ? <div className="border-t border-border px-6 py-6">{children}</div> : null}
    </details>
  );
}
