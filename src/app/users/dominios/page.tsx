import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { Domains } from "@/components/sites/eagenda-com-br-a1f95f96/users-dominios-fd8bad5e/Domains";

// Clone of https://eagenda.com.br/users/dominios/?version=3 — "Gerenciamento de Domínios".
export const metadata: Metadata = {
  title: "Gerenciamento de Domínios - Seiri",
};

// The original highlights nothing in the v3 menu here: it is only linked from the legacy one.
export default function DomainsRoute() {
  return (
    <DashboardShell title="Gerenciamento de Domínios" email="contato@exemplo.com.br" active="">
      <Domains />
    </DashboardShell>
  );
}
