import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { BlockLists } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-limites-lista_bloqueios-46e5fe0a/BlockLists";

// Clone of https://eagenda.com.br/agendamentos/limites/lista_bloqueios?version=3 (no blocks, like the live account).
export const metadata: Metadata = {
  title: "Listas de Bloqueio - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function BlockListsPage() {
  return (
    <DashboardShell title="Listas de Bloqueio" email="contato@exemplo.com.br" active="Listas de Bloqueio">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <BlockLists />
      </div>
    </DashboardShell>
  );
}
