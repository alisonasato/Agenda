import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { NewAppointmentForm } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-novo_agendamento-90f22910/NewAppointmentForm";

// Clone of https://eagenda.com.br/agendamentos/novo_agendamento/?version=3 (mock options, no backend).
export const metadata: Metadata = {
  title: "Novo Agendamento - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function NewAppointmentPage() {
  return (
    <DashboardShell title="Novo Agendamento" email="contato@exemplo.com.br" active="Novo Agendamento">
      <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-10 py-8 min-w-0">
        <NewAppointmentForm />
      </div>
    </DashboardShell>
  );
}
