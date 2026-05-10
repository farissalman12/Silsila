import { prisma } from "@/lib/prisma";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Submit a new person, relationship, or correction to the Silsila ancestry archive.",
};

export default async function ContributePage() {
  const [villages, clans] = await Promise.all([
    prisma.village.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.clan.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contribute" }]} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Contribute to Silsila
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">
          Help preserve Hunza Valley&apos;s heritage by adding family records. All contributions are reviewed before publication.
        </p>
      </div>

      <ContributeForm villages={villages} clans={clans} />
    </div>
  );
}
