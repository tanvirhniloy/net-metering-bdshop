import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, priority: 1 },
    ...CATEGORIES.map((c) => ({ url: `${siteConfig.url}/${c.slug}`, lastModified: now, priority: 0.8 })),
  ];
}
