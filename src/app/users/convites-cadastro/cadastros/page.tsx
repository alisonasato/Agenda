import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ReceivedRegistrations } from "@/components/sites/eagenda-com-br-a1f95f96/users-convites-cadastro-cadastros-6ade1feb/ReceivedRegistrations";

// Clone of https://eagenda.com.br/users/convites-cadastro/cadastros/?version=3 — "Cadastros de Clientes".
export const metadata: Metadata = {
  title: "Cadastros de Clientes - Seiri",
};

export default function ReceivedRegistrationsRoute() {
  return (
    <DashboardShell title="Cadastros de Clientes" email="contato@exemplo.com.br" active="Cadastros Recebidos">
      <ReceivedRegistrations />
    </DashboardShell>
  );
}
