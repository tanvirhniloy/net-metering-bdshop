import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectoryPage } from "@/components/DirectoryPage";
import { CATEGORIES, CATEGORY_BY_ID, isCategoryId } from "@/lib/categories";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  if (!isCategoryId(category)) return {};
  const c = CATEGORY_BY_ID[category];
  return {
    title: `${c.label} | SREDA Approved Solar Equipment`,
    description: c.description + " Search and compare with Net Metering by BDSHOP.",
    alternates: { canonical: `/${c.slug}` },
    openGraph: { url: `/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!isCategoryId(category)) notFound();
  return <DirectoryPage category={category} />;
}
