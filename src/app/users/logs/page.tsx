import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { TeamLogs } from "@/components/sites/eagenda-com-br-a1f95f96/users-logs-ce6c6049/TeamLogs";

// Clone of https://eagenda.com.br/users/logs/?version=3 — "Histórico de Atividades de Usuários".
export const metadata: Metadata = {
  title: "Histórico de Atividades de Usuários - Seiri",
};

export default function TeamLogsRoute() {
  return (
    <DashboardShell title="Histórico de Atividades de Usuários" email="contato@exemplo.com.br" active="Convidar equipe">
      <Suspense>
        <TeamLogs />
      </Suspense>
    </DashboardShell>
  );
}
