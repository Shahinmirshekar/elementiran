import type { Metadata } from "next";
import Link from "next/link";
import { CatalogBand, Consult, PageHead, Pending, Section } from "@/components/Parts";
import { products } from "@/content/site";

export const metadata: Metadata = { title: "محصولات" };

export default function Products() {
  return (
    <>
      <PageHead title="محصولات" lead="از کابل حرارتی صنعتی تا گرمایش خانگی." />
      <Section>
        <ul className="grid gap-x-10 gap-y-14 md:grid-cols-2">
          {products.map((p) => (
            <li key={p.slug}>
              <Link href={`/products/${p.slug}`} className="group block">
                <Pending what={`تصویر ${p.title}`} ratio="16 / 10" />
                <h2 className="mt-5 text-3xl font-extrabold group-hover:text-ember">{p.title}</h2>
                <p className="mt-2 text-coal/75">{p.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CatalogBand />
      <Consult />
    </>
  );
}
