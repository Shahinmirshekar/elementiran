import type { Metadata } from "next";
import { Consult, PageHead, Pending, Section } from "@/components/Parts";
import { projects } from "@/content/site";

export const metadata: Metadata = { title: "پروژه‌ها" };

export default function Projects() {
  return (
    <>
      <PageHead title="پروژه‌های اجراشده" lead="نمونه‌هایی از کارهای المنتیران. گالری تصاویر هر پروژه پس از انتقال از سایت فعلی اینجا قرار می‌گیرد." />
      <Section>
        <ul className="space-y-16">
          {projects.map((name) => (
            <li key={name} className="grid gap-6 border-t-2 border-coal pt-6 lg:grid-cols-12">
              <h2 className="text-3xl font-black sm:text-4xl lg:col-span-4">{name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
                <Pending what="تصاویر پروژه" ratio="4 / 3" />
                <Pending what="شرح پروژه" ratio="4 / 3" />
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Consult />
    </>
  );
}
