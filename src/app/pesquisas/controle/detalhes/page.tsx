import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { SurveyDetails, SurveyDetailsHeader } from "@/components/sites/eagenda-com-br-a1f95f96/pesquisas-controle-detalhes-18e85728/SurveyDetails";

// Clone of https://eagenda.com.br/pesquisas/controle/<id>?version=3, the form's question editor.
// Same reason as the other pages keyed by a record: a static export cannot ship one page per form,
// so it reads ?id=.
export const metadata: Metadata = {
  title: "Detalhes do Formulário - Seiri",
};

export default function SurveyDetailsPage() {
  return (
    <DashboardShell
      header={
        <Suspense>
          <SurveyDetailsHeader />
        </Suspense>
      }
      email="contato@exemplo.com.br"
      active="Formulários"
    >
      <Suspense>
        <SurveyDetails />
      </Suspense>
    </DashboardShell>
  );
}
