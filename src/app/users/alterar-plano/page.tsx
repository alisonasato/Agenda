import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { PlanOffers } from "@/components/sites/eagenda-com-br-a1f95f96/users-alterar-plano-be26ebe1/PlanOffers";

// Clone of https://eagenda.com.br/users/alterar-plano/?version=3 — "Alterar Plano".
export const metadata: Metadata = {
  title: "Planos de Assinaturas - Seiri",
};

export default function PlanOffersRoute() {
  return (
    <DashboardShell title="Alterar Plano" email="contato@exemplo.com.br" active="Meu Plano">
      <PlanOffers />
    </DashboardShell>
  );
}
