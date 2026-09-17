import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AgendaSettings } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-configurar-fc2519d1/AgendaSettings";

// Clone of https://eagenda.com.br/agendamentos/configurar/?version=3 (one mock agenda).
export const metadata: Metadata = {
  title: "Configuração de Agendas - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function AgendaSettingsPage() {
  return (
    <DashboardShell title="Agendas" email="contato@exemplo.com.br" active="Configuração">
      <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-10 py-8 min-w-0">
        <AgendaSettings />
      </div>
    </DashboardShell>
  );
}
