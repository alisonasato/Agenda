import { Fragment } from "react";

const LINKS = ["FAQ", "Termos", "Privacidade", "Contato"];

export function FooterBar() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500 lato-regular">
          {LINKS.map((l, i) => (
            <Fragment key={l}>
              {i > 0 && <span className="text-gray-300">·</span>}
              <a href="#" className="hover:text-gray-600 transition-colors px-1.5 py-0.5">
                {l}
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
