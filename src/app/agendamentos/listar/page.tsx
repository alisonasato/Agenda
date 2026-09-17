import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AppointmentsList } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-listar-96e99b09/AppointmentsList";

// Clone of https://eagenda.com.br/agendamentos/listar/?version=3 (empty list, like the live account).
export const metadata: Metadata = {
  title: "Listar Agendamentos - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function AppointmentsPage() {
  return (
    <DashboardShell title="Listar Agendamentos" email="contato@exemplo.com.br" active="Agendamentos">
      <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-10 py-8 min-w-0">
        <AppointmentsList />
      </div>
    </DashboardShell>
  );
}
