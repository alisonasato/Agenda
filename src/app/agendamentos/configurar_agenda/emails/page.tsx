import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AgendaEmails } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-configurar_agenda-emails-674115b9/AgendaEmails";

// Clone of https://eagenda.com.br/agendamentos/configurar_agenda/<id>/emails — "Configurar Email" on an agenda card.
export const metadata: Metadata = {
  title: "Modelos de Email da Agenda - Seiri",
};

// A static export has no per-agenda route, so the agenda arrives as ?id=.
export default function AgendaEmailsRoute() {
  return (
    <DashboardShell title="Modelos de Email da Agenda" email="contato@exemplo.com.br" active="Configuração">
      <Suspense>
        <AgendaEmails />
      </Suspense>
    </DashboardShell>
  );
}
