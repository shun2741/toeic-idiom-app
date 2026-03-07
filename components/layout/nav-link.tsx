"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-slate-600 hover:bg-primary/6 hover:text-slate-950",
      )}
    >
      {label}
    </Link>
  );
}
