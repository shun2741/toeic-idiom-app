import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/feedback", label: "フィードバック" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>TOEIC Idiom Coach beta</p>
        <nav className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              className="transition hover:text-slate-950"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
