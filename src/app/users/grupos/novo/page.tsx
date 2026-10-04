import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AgendaGroupForm } from "@/components/sites/eagenda-com-br-a1f95f96/users-grupos-novo-7762209d/AgendaGroupForm";

// Clone of https://eagenda.com.br/users/grupos/novo?version=3 — "Adicionar Etapa" on the booking screen.
export const metadata: Metadata = {
  title: "Novo Grupo de Agendas - Seiri",
};

// Editing an existing step arrives as ?id=, the way the other forms of this clone do.
export default function AgendaGroupRoute() {
  return (
    <DashboardShell title="Novo Grupo de Agendas" email="contato@exemplo.com.br" active="Tela de Agendamento">
      <Suspense>
        <AgendaGroupForm />
      </Suspense>
    </DashboardShell>
  );
}
