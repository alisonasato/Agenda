import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { PlansPage } from "@/components/sites/eagenda-com-br-a1f95f96/users-planos-0db9b9b5/PlansPage";

// Clone of https://eagenda.com.br/users/planos/?version=3 (free plan, no invoices, like the live account).
export const metadata: Metadata = {
  title: "Administrar Planos - Seiri",
};

export default function PlansRoute() {
  return (
    <DashboardShell title="Administrar Planos" email="contato@exemplo.com.br" active="Planos">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <PlansPage />
      </div>
    </DashboardShell>
  );
}
