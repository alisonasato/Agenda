import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AgendaAdmin } from "@/components/sites/eagenda-com-br-a1f95f96/painel-controle-3afc63eb/AgendaAdmin";

// Clone of https://eagenda.com.br/painel/controle?version=3 (no agendas or manual hours listed, like the live account).
export const metadata: Metadata = {
  title: "Administrar Agendas - Seiri",
};

export default function AgendaAdminPage() {
  return (
    <DashboardShell title="Administrar Agendas" email="contato@exemplo.com.br" active="Administrar Agendas">
      <div id="agenda-admin" className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <AgendaAdmin />
      </div>
    </DashboardShell>
  );
}
