import type { Metadata } from "next";
import { Consult, PageHead, Pending, Section } from "@/components/Parts";

export const metadata: Metadata = { title: "درباره ما" };

export default function About() {
  return (
    <>
      <PageHead title="درباره المنتیران" lead="المنتیران در زمینه گرمایش الکتریکی صنعتی، ساختمانی و خانگی فعالیت می‌کند." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-5 text-lg lg:col-span-7">
            <p>
              حوزه کار ما کابل‌های حرارتی و هیت تریسینگ، گرمایش از کف برقی، گرم‌کن ضد بخار آینه، حوله گرم‌کن برقی،
              زیرفرشی برقی و المنت‌های صنعتی است.
            </p>
            <p>
              مخاطبان ما از مهندسان و خریداران صنعتی تا پیمانکاران ساختمان، معماران و مصرف‌کنندگان خانگی را در بر می‌گیرند.
            </p>
          </div>
          <div className="lg:col-span-5">
            <Pending what="تاریخچه شرکت، سوابق و همکاری‌ها" ratio="4 / 3" />
          </div>
        </div>
      </Section>
      <Consult />
    </>
  );
}
