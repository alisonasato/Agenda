import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AgendaLogs } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-historico-75c61104/AgendaLogs";

// Clone of https://eagenda.com.br/agendamentos/historico/<id> — "Logs" on an agenda card.
export const metadata: Metadata = {
  title: "Histórico de Configurações - Seiri",
};

// A static export has no per-agenda route, so the agenda arrives as ?id=.
export default function AgendaLogsRoute() {
  return (
    <DashboardShell title="Histórico de Configurações" email="contato@exemplo.com.br" active="Configuração">
      <Suspense>
        <AgendaLogs />
      </Suspense>
    </DashboardShell>
  );
}
