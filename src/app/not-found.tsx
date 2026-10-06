import type { Metadata } from "next";
import { NotFoundActions } from "@/components/sites/eagenda-com-br-a1f95f96/shared/NotFoundActions";

// Clone of the original's 404 page, which any unknown path falls through to.
export const metadata: Metadata = {
  title: "404 - Página não encontrada | Seiri",
};

export default function NotFound() {
  // The app's body is a flex row for the dashboard shell, so this page claims the whole row.
  return (
    <div id="main-content" className="flex-1 w-full min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <div className="w-full flex-1 flex items-center justify-center min-h-screen">
        <div className="max-w-lg w-full text-center animate-fade-in px-6">
          <div className="mb-6">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 animate-bounce-soft">
              <svg
                className="w-12 h-12 text-primary animate-spin-slow"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            </span>
          </div>
          <h1 className="text-6xl font-extrabold text-primary mb-2 animate-fade-in-delay">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Página não encontrada</h2>
          <p className="text-base text-gray-500 mb-8">
            Desculpe, não conseguimos encontrar a página que você procurava.
            <br />
            Verifique o endereço ou volte para a página inicial.
          </p>
          <NotFoundActions />
        </div>
      </div>
    </div>
  );
}
