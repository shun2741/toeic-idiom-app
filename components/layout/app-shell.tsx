import Link from "next/link";
import { BookOpen, History, LayoutDashboard, LogOut, RotateCcw } from "lucide-react";

import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/learn", label: "学習", icon: BookOpen },
  { href: "/review", label: "復習", icon: RotateCcw },
  { href: "/history", label: "履歴", icon: History },
];

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="animate-fade-up rounded-[32px] border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
              >
                TI
              </Link>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
                  TOEIC Idiom Coach
                </p>
                <p className="text-sm text-slate-500">
                  自由入力で英熟語を定着させる学習ダッシュボード
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <div key={item.href} className="flex items-center gap-2">
                    <item.icon className="hidden h-4 w-4 text-slate-400 sm:block" />
                    <NavLink href={item.href} label={item.label} />
                  </div>
                ))}
              </nav>

              <div className="flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-slate-500">ログイン中</p>
                  <p className="max-w-48 truncate text-sm text-slate-800">{userEmail ?? "Google User"}</p>
                </div>
                <form action="/auth/signout" method="post">
                  <Button size="sm" variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
