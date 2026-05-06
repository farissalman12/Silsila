import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Silsila",
  description: "About the Silsila project — preserving Hunza Valley's living ancestry archive.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6">
        About Silsila
      </h1>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
          <strong>Silsila</strong> (سلسلہ) means &ldquo;chain&rdquo; or &ldquo;lineage&rdquo; in Urdu and Persian.
          This project is a community-driven effort to digitize, preserve, and visually explore the
          generational family trees of all communities in the Hunza Valley, Pakistan.
        </p>

        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-10 mb-4">
          Our Mission
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          The oral traditions that have preserved Hunza&apos;s genealogies for centuries are fading.
          As the diaspora grows, the knowledge held by village elders risks being lost. Silsila exists
          to capture this living heritage in a structured, searchable, and beautiful digital archive —
          before it&apos;s too late.
        </p>

        <h2 id="privacy" className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-10 mb-4">
          Privacy & Ethics
        </h2>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li>Living persons are shown with restricted details by default</li>
          <li>Privacy levels: <strong>Public</strong>, <strong>Family-only</strong>, and <strong>Private</strong></li>
          <li>Any individual can request removal of their data</li>
          <li>Deceased persons with 50+ years since death are publicly visible</li>
          <li>All contributions are reviewed before publication</li>
        </ul>

        <h2 id="guidelines" className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-10 mb-4">
          Data Guidelines
        </h2>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li>All data must come from verifiable sources (oral history, documents, NADRA records)</li>
          <li>Each record requires at least one source citation</li>
          <li>Approximate dates are marked with the ~ prefix</li>
          <li>Contributions are reviewed by village administrators</li>
        </ul>

        <h2 id="contact" className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-10 mb-4">
          Contact
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Silsila is an open community project. To contribute, report an issue, or request data
          removal, please{" "}
          <Link href="/auth/register" className="text-amber-600 hover:underline">create an account</Link>
          {" "}or reach out to the project maintainers.
        </p>
      </div>
    </div>
  );
}
