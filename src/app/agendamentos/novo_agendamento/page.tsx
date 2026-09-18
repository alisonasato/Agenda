import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { NewAppointmentForm } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-novo_agendamento-90f22910/NewAppointmentForm";

// Clone of https://eagenda.com.br/agendamentos/novo_agendamento/?version=3 (mock options, no backend).
export const metadata: Metadata = {
  title: "Novo Agendamento - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function NewAppointmentPage() {
  return (
    <DashboardShell title="Novo Agendamento" email="contato@exemplo.com.br" active="Novo Agendamento">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
        <NewAppointmentForm />
      </div>
    </DashboardShell>
  );
}
