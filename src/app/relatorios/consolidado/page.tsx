import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ConsolidatedReport } from "@/components/sites/eagenda-com-br-a1f95f96/relatorios-consolidado-490246d7/ConsolidatedReport";

// Clone of https://eagenda.com.br/relatorios/consolidado?version=3 (no data in the period, like the live account).
export const metadata: Metadata = {
  title: "Relatório Consolidado - Seiri",
};

export default function ConsolidatedReportPage() {
  return (
    <DashboardShell title="Relatório Consolidado" email="contato@exemplo.com.br" active="Consolidado">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <ConsolidatedReport />
      </div>
    </DashboardShell>
  );
}
