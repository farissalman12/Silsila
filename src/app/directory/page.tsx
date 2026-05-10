import { getNetworkData } from "@/lib/data/network";
import { NetworkGraph } from "@/components/tree/NetworkGraph";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Family Directory",
  description: "Interactive network visualization of all documented families in the Hunza Valley ancestry archive.",
};

export default async function DirectoryPage() {
  const { persons, relationships, villages } = await getNetworkData();

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Family Directory
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {persons.length} people across {villages.length} villages · Click any node to view their family tree
        </p>
      </div>
      <div className="flex-1">
        <NetworkGraph persons={persons} relationships={relationships} villages={villages} />
      </div>
    </div>
  );
}
