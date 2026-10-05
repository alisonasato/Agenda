import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ConfirmPlan } from "@/components/sites/eagenda-com-br-a1f95f96/users-confirmar-plano-16606ecd/ConfirmPlan";

// Clone of https://eagenda.com.br/users/confirmar-plano/<id>?version=3 — "Confirmar Plano".
export const metadata: Metadata = {
  title: "Confirmar Plano - Seiri",
};

// A static export has no per-plan route, so the plan arrives as ?id=.
export default function ConfirmPlanRoute() {
  return (
    <DashboardShell title="Confirmar Plano" email="contato@exemplo.com.br" active="Meu Plano">
      <Suspense>
        <ConfirmPlan />
      </Suspense>
    </DashboardShell>
  );
}
