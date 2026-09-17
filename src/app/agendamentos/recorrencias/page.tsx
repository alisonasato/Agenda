import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { RecurringAppointments } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-recorrencias-cb174cda/RecurringAppointments";

// Clone of https://eagenda.com.br/agendamentos/recorrencias?version=3 (no recurrences, like the live account).
export const metadata: Metadata = {
  title: "Agendamentos Recorrentes - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function RecurringAppointmentsPage() {
  return (
    <DashboardShell title="Recorrências" email="contato@exemplo.com.br" active="Agendamentos Recorrentes">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <RecurringAppointments />
      </div>
    </DashboardShell>
  );
}
