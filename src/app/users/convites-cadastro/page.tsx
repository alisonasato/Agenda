import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { RegistrationInvites } from "@/components/sites/eagenda-com-br-a1f95f96/users-convites-cadastro-a566fa3a/RegistrationInvites";

// Clone of https://eagenda.com.br/users/convites-cadastro/?version=3 — "Convites de Cadastro".
export const metadata: Metadata = {
  title: "Convites de Cadastro - Seiri",
};

export default function RegistrationInvitesRoute() {
  return (
    <DashboardShell title="Convites de Cadastro" email="contato@exemplo.com.br" active="Convites de Cadastro">
      <RegistrationInvites />
    </DashboardShell>
  );
}
