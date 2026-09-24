import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { WaitingListPage } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-listar-espera-34d263fa/WaitingListPage";

// Clone of https://eagenda.com.br/agendamentos/listar/espera?version=3 (nobody waiting).
export const metadata: Metadata = {
  title: "Lista de Espera - Seiri",
};

export default function WaitingListRoute() {
  return (
    <DashboardShell title="Lista de Espera" email="contato@exemplo.com.br" active="Lista de Espera">
      <WaitingListPage />
    </DashboardShell>
  );
}
