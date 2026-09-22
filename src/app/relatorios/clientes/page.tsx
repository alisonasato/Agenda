import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ClientsReport } from "@/components/sites/eagenda-com-br-a1f95f96/relatorios-clientes-f8ceb518/ClientsReport";

// Clone of https://eagenda.com.br/relatorios/clientes/?version=3 (no data in the period, like the live account).
export const metadata: Metadata = {
  title: "Relatório de Clientes - Seiri",
};

export default function ClientsReportPage() {
  return (
    <DashboardShell title="Relatório de Clientes" email="contato@exemplo.com.br" active="Clientes">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <ClientsReport />
      </div>
    </DashboardShell>
  );
}
