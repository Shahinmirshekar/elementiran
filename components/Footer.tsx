import Link from "next/link";
import { CATALOG_URL, LIVE_SITE, nav, products } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-coal text-paper/75">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-3xl font-black text-paper">المنتیران</p>
          <p className="mt-4 max-w-sm">
            کابل حرارتی، گرمایش از کف و المنت صنعتی برای پروژه‌های صنعتی، ساختمانی و خانگی.
          </p>
          <p className="mt-6 text-sm">
            نشانی و شماره‌های تماس از{" "}
            <a href={LIVE_SITE} className="underline underline-offset-4 hover:text-heat">سایت فعلی المنتیران</a>{" "}
            منتقل می‌شود.
          </p>
        </div>
        <nav aria-label="محصولات" className="md:col-span-4">
          <h2 className="mb-4 font-bold text-paper">محصولات</h2>
          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.slug}><Link href={`/products/${p.slug}`} className="hover:text-heat">{p.title}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="بخش‌های سایت" className="md:col-span-3">
          <h2 className="mb-4 font-bold text-paper">المنتیران</h2>
          <ul className="space-y-2">
            {nav.slice(1).map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-heat">{n.label}</Link></li>
            ))}
            <li><a href={CATALOG_URL} className="hover:text-heat">دانلود کاتالوگ (PDF)</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
