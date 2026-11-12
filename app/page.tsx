import Link from "next/link";
import { FloorSection } from "@/components/FloorSection";
import { HeatField } from "@/components/HeatField";
import { HeatLoop } from "@/components/HeatLoop";
import { CatalogBand, Consult, Section } from "@/components/Parts";
import { products, projects, solutionGroups } from "@/content/site";

export default function Home() {
  return (
    <>
      <section className="blueprint relative isolate overflow-hidden bg-coal text-paper">
        <HeatField />
        <div className="wrap relative grid items-center gap-10 pb-14 pt-12 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-12 lg:gap-4 lg:pt-16">
          <div className="lg:col-span-7">
            <h1 className="text-[2.75rem] font-black leading-[1.15] sm:text-7xl xl:text-[6.5rem]">مهندسی گرما، برای آینده‌ای هوشمند</h1>
            <p className="mt-7 max-w-xl text-lg text-paper/80">
              المنتیران کابل حرارتی، سیستم گرمایش از کف و المنت صنعتی را برای پروژه‌های صنعتی، ساختمانی و خانگی تأمین می‌کند.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/products" className="btn btn-heat">مشاهده محصولات</Link>
              <Link href="/contact" className="btn btn-line">دریافت مشاوره تخصصی</Link>
            </div>
          </div>
          <HeatLoop className="w-full lg:col-span-5 lg:-ms-24 lg:w-[150%] lg:max-w-none" />
        </div>
        <div className="wrap relative pb-8">
          <div className="thermal-scale" aria-hidden="true" />
          <div className="mt-2 flex justify-between text-sm text-paper/70" aria-hidden="true">
            <span>سرد</span>
            <span>گرم</span>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-4xl font-black sm:text-5xl lg:sticky lg:top-10">محصولات</h2>
          </div>
          <ul className="border-t border-coal/25 lg:col-span-8">
            {products.map((p) => (
              <li key={p.slug} className="heat-row border-b border-coal/25">
                <Link href={`/products/${p.slug}`} className="grid items-center gap-2 px-4 py-8 sm:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] sm:gap-8 sm:px-6">
                  <h3 className="text-3xl font-black sm:text-4xl">{p.title}</h3>
                  <p className="text-coal/80">{p.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <section className="bg-graphite py-16 text-paper lg:py-24">
        <div className="wrap">
          <h2 className="max-w-3xl text-4xl font-black sm:text-5xl">یک فناوری، سه مقیاس کاربرد</h2>
          <div className="mt-12 grid gap-px bg-white/15 md:grid-cols-3">
            {solutionGroups.map((g) => (
              <div key={g.id} className="bg-graphite py-8 md:px-8 md:first:ps-0 md:last:pe-0">
                <h3 className="text-2xl font-extrabold text-heat">{g.title}</h3>
                <ul className="mt-5 space-y-3">
                  {g.items.map((i) => (
                    <li key={i.title}>
                      <Link href={`/solutions#${g.id}`} className="text-lg underline-offset-4 hover:underline">{i.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-black sm:text-5xl">گرما، درست همان‌جا که لازم است</h2>
            <p className="mt-6 max-w-xl text-lg">
              کابل حرارتی برق را در طول خود به گرما تبدیل می‌کند. وقتی دور لوله بپیچد دمای سیال را نگه می‌دارد،
              و وقتی زیر کف یا روی رمپ پهن شود سطح را گرم می‌کند.
            </p>
            <p className="mt-4 max-w-xl text-coal/75">
              به این روش در صنعت «هیت تریسینگ» می‌گویند. همین اصل در ساختمان برای گرمایش از کف و آب‌کردن برف و یخ به کار می‌رود.
            </p>
            <Link href="/solutions" className="btn btn-line mt-8">راهکارها را ببینید</Link>
          </div>
          <FloorSection />
        </div>
      </Section>

      <section className="blueprint on-dark bg-coal py-16 text-paper lg:py-24">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-4xl font-black sm:text-5xl">پروژه‌های اجراشده</h2>
            <Link href="/projects" className="btn btn-line">همه پروژه‌ها</Link>
          </div>
          <ul className="mt-12 border-t border-white/15">
            {projects.map((name) => (
              <li key={name} className="border-b border-white/15">
                <Link href="/projects" className="block py-6 lg:py-8">
                  <h3 className="ignite text-5xl font-black leading-tight sm:text-7xl lg:text-8xl">{name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CatalogBand />
      <Consult />
    </>
  );
}
