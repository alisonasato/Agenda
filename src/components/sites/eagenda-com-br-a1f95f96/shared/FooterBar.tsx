import { Fragment } from "react";
import { InstagramIcon, LinkedinIcon } from "./icons";

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
          <span>© eAgenda</span>
          <span className="text-gray-300">·</span>
          <a href="https://mupisystems.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
            Mupi Systems
          </a>
          <div className="flex items-center gap-1.5 ml-1">
            <a href="https://www.instagram.com/mupisystems" target="_blank" rel="noopener noreferrer" className="text-pink-300 hover:text-pink-500 transition-colors" aria-label="Instagram">
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.linkedin.com/company/mupi-systems" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-500 transition-colors" aria-label="LinkedIn">
              <LinkedinIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
