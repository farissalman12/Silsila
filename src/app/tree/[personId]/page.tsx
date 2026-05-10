import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TreeViewClient } from "@/components/tree/TreeViewClient";
import type { Metadata } from "next";

interface TreePageProps {
  params: Promise<{ personId: string }>;
}

export async function generateMetadata({ params }: TreePageProps): Promise<Metadata> {
  const { personId } = await params;
  const person = await prisma.person.findUnique({
    where: { id: personId, deletedAt: null },
    select: { fullName: true },
  });
  if (!person) return { title: "Tree Not Found" };
  return {
    title: `Family Tree — ${person.fullName}`,
    description: `Interactive family tree visualization for ${person.fullName} from the Hunza Valley ancestry archive.`,
  };
}

export default async function TreePage({ params }: TreePageProps) {
  const { personId } = await params;
  const person = await prisma.person.findUnique({
    where: { id: personId, deletedAt: null },
    select: { id: true, fullName: true },
  });

  if (!person) notFound();

  return <TreeViewClient personId={person.id} personName={person.fullName} />;
}
