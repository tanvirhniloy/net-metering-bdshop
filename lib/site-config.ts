/**
 * Central place for branding, links and replaceable assets.
 * To replace the banner, overwrite public/banner.svg or change `bannerSrc` (keep a 1200 x 160 image).
 */
export const siteConfig = {
  name: "Net Metering by BDSHOP",
  shortName: "Net Metering",
  brand: "BDSHOP",
  title: "Net Metering by BDSHOP | SREDA Approved Solar Equipment",
  description:
    "Explore SREDA-approved solar panels, single-phase inverters, and three-phase inverters for Bangladesh's Net Metering Program. Search and compare solar equipment with Net Metering by BDSHOP.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  bannerSrc: "/banner.png",
  bannerAlt: "Solar panels and sun illustration banner for Net Metering by BDSHOP",
  links: {
    // Placeholders: update these to the final destinations.
    bdshop: "https://bdshop.com",
    sredaGuidelines: "https://sreda.gov.bd",
    contact: "https://bdshop.com/contact",
  },
};
