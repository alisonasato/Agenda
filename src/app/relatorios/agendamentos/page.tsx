import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AppointmentsReport } from "@/components/sites/eagenda-com-br-a1f95f96/relatorios-agendamentos-5ef02d40/AppointmentsReport";

// Clone of https://eagenda.com.br/relatorios/agendamentos/?version=3 (no report generated yet, like the live account).
export const metadata: Metadata = {
  title: "Relatório de Agendamentos - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function AppointmentsReportPage() {
  return (
    <DashboardShell title="Relatório de Agendamentos" email="contato@exemplo.com.br" active="relatorioAgendamentos">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <AppointmentsReport />
      </div>
    </DashboardShell>
  );
}
