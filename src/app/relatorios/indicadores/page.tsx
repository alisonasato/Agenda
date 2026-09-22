import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { IndicatorsReport } from "@/components/sites/eagenda-com-br-a1f95f96/relatorios-indicadores-6e858678/IndicatorsReport";

// Clone of https://eagenda.com.br/relatorios/indicadores/?version=3 (every indicator at zero, like the live account).
export const metadata: Metadata = {
  title: "Indicadores Gerenciais - Seiri",
};

export default function IndicatorsReportPage() {
  return (
    <DashboardShell title="Indicadores Gerenciais" email="contato@exemplo.com.br" active="Indicadores Gerenciais">
      {/* #indicadores scopes this page's own styles (see inline-styles.css). */}
      <div id="indicadores" className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <IndicatorsReport />
      </div>
    </DashboardShell>
  );
}
