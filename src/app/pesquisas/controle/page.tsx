import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { SurveysPage } from "@/components/sites/eagenda-com-br-a1f95f96/pesquisas-controle-327168bf/SurveysPage";

// Clone of https://eagenda.com.br/pesquisas/controle/?version=3 (no forms yet, like the live account).
export const metadata: Metadata = {
  title: "Formulários - Seiri",
};

export default function SurveysControlPage() {
  return (
    <DashboardShell title="Formulários" email="contato@exemplo.com.br" active="Formulários">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
        <SurveysPage />
      </div>
    </DashboardShell>
  );
}
