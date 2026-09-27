import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AgendaForm } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-configurar-agenda-add-8d439243/AgendaForm";

// Clone of https://eagenda.com.br/agendamentos/configurar/agenda/add?version=3. The original edits an
// existing agenda at /agendamentos/configurar_agenda/E<id>; here the same page takes ?id=.
export const metadata: Metadata = {
  title: "Configurações Gerais da Agenda - Seiri",
};

export default function AgendaFormPage() {
  return (
    <DashboardShell title="Configurações Gerais da Agenda" email="contato@exemplo.com.br" active="Configuração">
      <Suspense>
        <AgendaForm />
      </Suspense>
    </DashboardShell>
  );
}
