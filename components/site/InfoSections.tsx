import { ExternalLink, Info } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function AboutNetMetering() {
  return (
    <section id="about-net-metering" className="border-t border-brand/10 bg-grad-band py-12" aria-labelledby="anm-h">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 id="anm-h" className="text-xl font-semibold">Understanding Net Metering in Bangladesh</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink/90">
          Net metering allows eligible electricity consumers with renewable energy systems to use the electricity they generate and
          export eligible surplus electricity to the grid, subject to applicable regulations and utility requirements.
        </p>
        <a
          href={siteConfig.links.sredaGuidelines}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-2 hover:underline"
        >
          Official SREDA net metering guidelines <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </section>
  );
}

export function ImportantNotice() {
  return (
    <section aria-labelledby="notice-h" className="py-10">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex gap-3 rounded border border-brand-2/40 border-l-4 border-l-accent bg-grad-soft p-4 md:p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div className="space-y-3 text-sm leading-relaxed">
            <h2 id="notice-h" className="text-base font-semibold">Important notice</h2>
            <p>
              Equipment information on this website is provided for reference based on the available SREDA-approved equipment lists.
              Users should verify the latest approval status, exact model specifications, and applicable net-metering requirements with
              the relevant authorities and utility provider before purchasing or installing equipment.
            </p>
            <p>
              Being listed for net metering does not automatically mean a product supports battery backup or hybrid operation. Hybrid
              functionality, battery compatibility, and grid-export approval are separate technical considerations and must be verified
              independently.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
