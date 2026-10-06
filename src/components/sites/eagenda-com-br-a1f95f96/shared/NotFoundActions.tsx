"use client";

import { ROUTES } from "./Sidebar";

const BTN = "btn font-bold py-2 px-6 rounded-lg shadow transition transform hover:scale-105 duration-200";

/** The 404's two buttons; the second one needs history, so this part runs in the browser. */
export function NotFoundActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
      <a href={ROUTES.painel} className={`${BTN} bg-primary text-white`}>
        Voltar para o início
      </a>
      <button type="button" onClick={() => window.history.back()} className={`${BTN} bg-white border border-primary text-primary`}>
        Voltar para a página anterior
      </button>
    </div>
  );
}
