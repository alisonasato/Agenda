import { Fragment } from "react";

// Institutional pages of the product site, not screens of the dashboard: the prototype does not
// host them, so these point off the app the way the Ajuda menu's outbound links do.
const SITE = "https://www.seiri.com.br";
const LINKS = [
  { label: "FAQ", href: `${SITE}/faq/` },
  { label: "Termos", href: `${SITE}/termos/` },
  { label: "Privacidade", href: `${SITE}/privacidade/` },
  { label: "Contato", href: `${SITE}/contato/` },
];

export function FooterBar() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500 lato-regular">
          {LINKS.map((l, i) => (
            <Fragment key={l.label}>
              {i > 0 && <span className="text-gray-300">·</span>}
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors px-1.5 py-0.5">
                {l.label}
              </a>
            </Fragment>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-xs text-gray-500 lato-regular">
          <span>© Seiri</span>
        </div>
      </div>
    </footer>
  );
}
