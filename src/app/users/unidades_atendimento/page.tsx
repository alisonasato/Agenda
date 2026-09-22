import { Suspense } from "react";
import type { Metadata } from "next";
import { UnitsPageBody, UnitsRoute } from "@/components/sites/eagenda-com-br-a1f95f96/users-unidades_atendimento-3be64c22/UnitsRoute";

// Clone of https://eagenda.com.br/users/unidades_atendimento/?version=3 (an account with no units).
export const metadata: Metadata = {
  title: "Unidades de Atendimento - Seiri",
};

// The static HTML is the list; ?action=create (Nova Unidade) is applied in the browser.
export default function UnitsPage() {
  return (
    <Suspense fallback={<UnitsPageBody create={false} />}>
      <UnitsRoute />
    </Suspense>
  );
}
