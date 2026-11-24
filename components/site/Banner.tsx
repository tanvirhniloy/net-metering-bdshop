import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

/** 1200 x 160 banner. Replace public/banner.svg (or change siteConfig.bannerSrc) to swap the artwork. */
export function Banner() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-4">
      <Image
        src={siteConfig.bannerSrc}
        alt={siteConfig.bannerAlt}
        width={1200}
        height={160}
        priority
        className="h-auto w-full rounded border border-line"
      />
    </div>
  );
}
