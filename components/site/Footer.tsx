import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-grad-dark text-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
            A reference directory of SREDA-listed solar modules and inverters for Bangladesh&apos;s Net Metering Program.
          </p>
        </div>
        <nav aria-label="Directory">
          <h2 className="text-sm font-semibold !text-white">Directory</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link className="hover:text-white hover:underline" href="/">Home</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.id}><Link className="hover:text-white hover:underline" href={`/${c.slug}#equipment`}>{c.label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <h2 className="text-sm font-semibold !text-white">More</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link className="hover:text-white hover:underline" href="/#about-net-metering">About Net Metering</Link></li>
            <li><a className="hover:text-white hover:underline" href={siteConfig.links.bdshop} target="_blank" rel="noopener noreferrer">BDSHOP.com</a></li>
            <li><a className="hover:text-white hover:underline" href={siteConfig.links.contact} target="_blank" rel="noopener noreferrer">Contact</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto max-w-[1200px] space-y-2 px-4 py-5 text-xs leading-relaxed text-white/70">
          <p>
            Disclaimer: Information is provided for reference only and may not reflect the latest SREDA approvals. Verify equipment
            status and requirements with SREDA and your utility before purchase or installation.
          </p>
          <p>© {year} BDSHOP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
