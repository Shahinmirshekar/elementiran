import Link from "next/link";
import type { ReactNode } from "react";
import { CATALOG_URL, LIVE_SITE } from "@/content/site";

/** Dark title band at the top of every inner page. */
export function PageHead({ title, lead, crumbs = [] }: { title: string; lead?: string; crumbs?: { href: string; label: string }[] }) {
  return (
    <div className="blueprint bg-coal text-paper">
      <div className="wrap py-16 lg:py-24">
        <nav aria-label="مسیر صفحه" className="mb-6 text-sm text-paper/60">
          <ol className="flex flex-wrap gap-2">
            <li><Link href="/" className="hover:text-heat">خانه</Link></li>
            {crumbs.map((c) => (
              <li key={c.href} className="before:me-2 before:content-['/']"><Link href={c.href} className="hover:text-heat">{c.label}</Link></li>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-4xl text-4xl font-black sm:text-5xl lg:text-6xl">{title}</h1>
        {lead && <p className="mt-6 max-w-2xl text-lg text-paper/80">{lead}</p>}
      </div>
    </div>
  );
}

/** Marks a slot whose original text or media has not been migrated yet. */
export function Pending({ what, ratio, dark = false }: { what: string; ratio?: string; dark?: boolean }) {
  return (
    <div className={`pending ${dark ? "on-dark text-paper/75" : "text-coal/75"} flex items-center justify-center p-6 text-center text-sm`}
      style={ratio ? { aspectRatio: ratio } : undefined}>
      <p>
        {what}
        <br />
        از <a href={LIVE_SITE} className="underline underline-offset-4">سایت فعلی</a> منتقل می‌شود.
      </p>
    </div>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`py-16 lg:py-24 ${className}`}><div className="wrap">{children}</div></section>;
}

export function CatalogBand() {
  return (
    <section className="bg-heat text-coal">
      <div className="wrap flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-black sm:text-4xl">کاتالوگ المنتیران</h2>
          <p className="mt-2 max-w-xl">معرفی محصولات و کاربردها در یک فایل PDF.</p>
        </div>
        <a href={CATALOG_URL} className="btn btn-coal shrink-0">دانلود کاتالوگ</a>
      </div>
    </section>
  );
}

export function Consult() {
  return (
    <Section className="bg-paper">
      <div className="grid gap-8 border-t-2 border-coal pt-10 md:grid-cols-12">
        <h2 className="text-3xl font-black sm:text-4xl md:col-span-7">برای انتخاب سیستم گرمایش پروژه‌تان با ما مشورت کنید.</h2>
        <div className="md:col-span-5">
          <p>کاربرد، ابعاد و شرایط محل نصب را بگویید تا محصول و روش اجرای مناسب را پیشنهاد کنیم.</p>
          <Link href="/contact" className="btn btn-coal mt-6">دریافت مشاوره تخصصی</Link>
        </div>
      </div>
    </Section>
  );
}
