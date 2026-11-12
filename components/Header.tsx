import Link from "next/link";
import { nav } from "@/content/site";

export function Header() {
  return (
    <header className="bg-coal text-paper">
      <p className="border-b border-white/10 bg-graphite py-1.5 text-center text-xs text-paper/80">
        پیش‌نمایش طراحی جدید؛ متن‌ها و تصاویر اصلی پس از انتقال از سایت فعلی جایگزین می‌شوند.
      </p>
      <div className="wrap flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-2xl font-black tracking-tight">المنتیران</span>
          <span dir="ltr" className="hidden text-sm font-light text-paper/60 sm:inline">Elementiran</span>
        </Link>

        <nav aria-label="منوی اصلی" className="hidden lg:block">
          <ul className="flex gap-7 text-[0.95rem]">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="py-2 text-paper/80 transition-colors hover:text-heat">{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu: native disclosure, works without JavaScript */}
        <details className="group lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center border border-white/25 px-4 text-sm [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">منو</span>
            <span className="hidden group-open:inline">بستن</span>
          </summary>
          <nav aria-label="منوی اصلی" className="absolute inset-x-0 z-20 mt-4 border-y border-white/10 bg-coal">
            <ul className="wrap divide-y divide-white/10">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-4 text-lg">{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
