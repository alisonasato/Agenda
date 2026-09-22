import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { TeamAdmin } from "@/components/sites/eagenda-com-br-a1f95f96/users-adm_equipe-d6d5c7ca/TeamAdmin";

// Clone of https://eagenda.com.br/users/adm_equipe/?version=3 (only the owner, as a mock user).
export const metadata: Metadata = {
  title: "Administrar Equipe - Seiri",
};

export default function TeamAdminPage() {
  return (
    <DashboardShell title="Administrar Equipe" email="contato@exemplo.com.br" active="Administrar Equipe">
      <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
        <TeamAdmin />
      </div>
    </DashboardShell>
  );
}
