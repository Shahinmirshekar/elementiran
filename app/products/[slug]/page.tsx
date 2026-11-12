import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogBand, Consult, PageHead, Pending, Section } from "@/components/Parts";
import { products } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const others = products.filter((x) => x.slug !== slug);

  return (
    <>
      <PageHead title={p.title} lead={p.summary} crumbs={[{ href: "/products", label: "محصولات" }]} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Pending what={`تصاویر ${p.title}`} ratio="4 / 3" />
          </div>
          <div className="space-y-10 lg:col-span-5">
            {p.uses.length > 0 && (
              <div>
                <h2 className="text-2xl font-extrabold">کاربردها</h2>
                <ul className="mt-4 divide-y divide-coal/15 border-y border-coal/15">
                  {p.uses.map((u) => <li key={u} className="py-3">{u}</li>)}
                </ul>
              </div>
            )}
            <div>
              <h2 className="mb-4 text-2xl font-extrabold">مشخصات فنی</h2>
              <Pending what="جدول مشخصات فنی" />
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-extrabold">راهنمای نصب</h2>
              <Pending what="متن راهنمای نصب" />
            </div>
          </div>
        </div>
      </Section>
      <Section className="bg-chalk">
        <h2 className="text-2xl font-extrabold">محصولات دیگر</h2>
        <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug} className="warm-row border-b border-coal/25">
              <Link href={`/products/${o.slug}`} className="block py-4 text-lg font-bold">{o.title}</Link>
            </li>
          ))}
        </ul>
      </Section>
      <CatalogBand />
      <Consult />
    </>
  );
}
