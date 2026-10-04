import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { UserGroups } from "@/components/sites/eagenda-com-br-a1f95f96/users-listar_grupos-d15668b6/UserGroups";

// Clone of https://eagenda.com.br/users/listar_grupos?version=3 — "Grupos de Usuários".
export const metadata: Metadata = {
  title: "Grupos de Usuários - Seiri",
};

export default function UserGroupsRoute() {
  return (
    <DashboardShell title="Grupos de Usuários" email="contato@exemplo.com.br" active="Convidar equipe">
      <UserGroups />
    </DashboardShell>
  );
}
