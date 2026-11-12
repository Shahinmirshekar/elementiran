import type { Metadata } from "next";
import { PageHead, Pending, Section } from "@/components/Parts";
import { CATALOG_URL } from "@/content/site";

export const metadata: Metadata = { title: "منابع و کاتالوگ‌ها" };

export default function Resources() {
  return (
    <>
      <PageHead title="منابع و کاتالوگ‌ها" lead="کاتالوگ، راهنماها و مستندات فنی المنتیران." />
      <Section>
        <ul className="border-t-2 border-coal">
          <li className="warm-row flex flex-wrap items-center justify-between gap-4 border-b border-coal/25 py-7">
            <div>
              <h2 className="text-2xl font-extrabold">کاتالوگ المنتیران</h2>
              <p className="text-coal/75">فایل PDF</p>
            </div>
            <a href={CATALOG_URL} className="btn btn-coal">دانلود کاتالوگ</a>
          </li>
        </ul>
        <div className="mt-12">
          <Pending what="راهنماهای نصب، برگه‌های مشخصات و سایر فایل‌ها" />
        </div>
      </Section>
    </>
  );
}
