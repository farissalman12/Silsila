import Link from "next/link";

const villages = [
  "Karimabad", "Altit", "Ganesh", "Gulmit",
  "Shimshal", "Passu", "Ghulkin", "Hussaini", "Misgar",
];

/**
 * Site footer with navigation links, village links, and project info.
 */
export function Footer() {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold">S</span>
              </div>
              <span className="text-lg font-serif font-bold text-white">Silsila</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Preserving the living ancestry of Hunza Valley — one family at a time.
              A community-driven genealogy archive.
            </p>
            <p className="text-xs text-stone-500 mt-3 font-serif italic">
              سلسلہ — &ldquo;The Chain of Lineage&rdquo;
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Navigate
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Search Archive", href: "/search" },
                { label: "Contribute", href: "/contribute" },
                { label: "About Silsila", href: "/about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Villages */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Villages
            </h3>
            <ul className="space-y-2">
              {villages.slice(0, 6).map((village) => (
                <li key={village}>
                  <Link
                    href={`/village/${village.toLowerCase()}`}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {village}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Project
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", href: "/about#privacy" },
                { label: "Data Guidelines", href: "/about#guidelines" },
                { label: "Contact", href: "/about#contact" },
                { label: "GEDCOM Import", href: "/dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Silsila — Hunza Valley Living Ancestry Archive.
            A community project.
          </p>
          <p className="text-xs text-stone-600">
            Built with ❤️ for the Hunza diaspora
          </p>
        </div>
      </div>
    </footer>
  );
}
