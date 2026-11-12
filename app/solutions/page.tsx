import type { Metadata } from "next";
import { FloorSection } from "@/components/FloorSection";
import { Consult, PageHead, Section } from "@/components/Parts";
import { solutionGroups } from "@/content/site";

export const metadata: Metadata = { title: "راهکارها" };

export default function Solutions() {
  return (
    <>
      <PageHead title="راهکارهای گرمایش الکتریکی" lead="هر کاربرد شرایط خودش را دارد؛ راهکارها را بر اساس محل استفاده مرتب کرده‌ایم." />
      {solutionGroups.map((g, i) => (
        <Section key={g.id} className={i % 2 ? "bg-chalk" : ""}>
          <div id={g.id} className="grid scroll-mt-8 gap-10 lg:grid-cols-12">
            <h2 className="text-4xl font-black sm:text-5xl lg:col-span-4">{g.title}</h2>
            <dl className="border-t border-coal/25 lg:col-span-8">
              {g.items.map((it) => (
                <div key={it.title} className="grid gap-1 border-b border-coal/25 py-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-8">
                  <dt className="text-xl font-extrabold">{it.title}</dt>
                  <dd className="text-coal/75">{it.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      ))}
      <Section>
        <div className="mx-auto max-w-3xl"><FloorSection /></div>
      </Section>
      <Consult />
    </>
  );
}
