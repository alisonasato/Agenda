import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AccountForm } from "@/components/sites/eagenda-com-br-a1f95f96/users-organizacao-contas-1a329ad2/AccountForm";

// Clone of https://eagenda.com.br/users/organizacao/contas/nova?version=3 ("Adicionar conta").
export const metadata: Metadata = {
  title: "Nova Conta - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function NewAccountPage() {
  return (
    <DashboardShell title="Nova Conta" email="contato@exemplo.com.br" active="Administrar Contas">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <AccountForm />
      </div>
    </DashboardShell>
  );
}
