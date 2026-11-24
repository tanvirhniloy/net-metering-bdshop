import { Banner } from "@/components/site/Banner";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { AboutNetMetering, ImportantNotice } from "@/components/site/InfoSections";
import { Directory } from "@/components/directory/Directory";
import { getDatasets } from "@/lib/data";
import type { CategoryId } from "@/lib/types";

export function DirectoryPage({ category }: { category: CategoryId }) {
  const datasets = getDatasets();
  return (
    <>
      <Header />
      <main>
        <Banner />
        <section id="equipment" className="mx-auto max-w-[1200px] px-4 pb-4 pt-6" aria-labelledby="page-h1">
          <Directory key={category} datasets={datasets} initialCategory={category} />
        </section>
        <ImportantNotice />
        <AboutNetMetering />
      </main>
      <Footer />
    </>
  );
}
