import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AccountsList } from "@/components/sites/eagenda-com-br-a1f95f96/users-organizacao-contas-1a329ad2/AccountsList";

// Clone of https://eagenda.com.br/users/organizacao/contas?version=3 (an organization with no sub-accounts).
export const metadata: Metadata = {
  title: "Contas da Organização - Seiri",
};

export default function AccountsPage() {
  return (
    <DashboardShell title="Administrar Contas" email="contato@exemplo.com.br" active="Administrar Contas">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <AccountsList />
      </div>
    </DashboardShell>
  );
}
