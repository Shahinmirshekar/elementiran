import type { Metadata } from "next";
import { PageHead, Pending, Section } from "@/components/Parts";
import { CATALOG_URL, LIVE_SITE } from "@/content/site";

export const metadata: Metadata = { title: "تماس با ما" };

export default function Contact() {
  return (
    <>
      <PageHead title="تماس با ما" lead="برای مشاوره فنی و استعلام محصول با المنتیران تماس بگیرید." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-black">پیش از تماس، این‌ها را آماده کنید</h2>
            <ul className="mt-6 divide-y divide-coal/15 border-y border-coal/15 text-lg">
              <li className="py-4">کاربرد: لوله، مخزن، کف، رمپ، بام یا دستگاه صنعتی</li>
              <li className="py-4">ابعاد یا متراژ محل نصب</li>
              <li className="py-4">دمای مورد نیاز و شرایط محیط</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={LIVE_SITE} className="btn btn-coal">اطلاعات تماس در سایت فعلی</a>
              <a href={CATALOG_URL} className="btn btn-line">دانلود کاتالوگ</a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Pending what="نشانی، تلفن، ایمیل و نقشه" ratio="1 / 1" />
          </div>
        </div>
      </Section>
    </>
  );
}
