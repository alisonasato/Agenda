import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { IndividualAccess } from "@/components/sites/eagenda-com-br-a1f95f96/users-clientes_autorizados-2f4b6ecf/IndividualAccess";

// Clone of https://eagenda.com.br/users/clientes_autorizados/?version=3 — "Gestão Individual".
export const metadata: Metadata = {
  title: "Acesso Individual de Clientes - Seiri",
};

export default function IndividualAccessRoute() {
  return (
    <DashboardShell title="Acesso Individual de Clientes" email="contato@exemplo.com.br" active="Acesso de Clientes">
      <IndividualAccess />
    </DashboardShell>
  );
}
