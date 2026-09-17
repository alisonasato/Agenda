import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ClientAccessLists } from "@/components/sites/eagenda-com-br-a1f95f96/users-clientes_autorizados-listas_acesso-5e72b5f0/ClientAccessLists";

// Clone of https://eagenda.com.br/users/clientes_autorizados/listas_acesso/?version=3 (no lists, like the live account).
export const metadata: Metadata = {
  title: "Listas de Controle de Acesso - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function ClientAccessPage() {
  return (
    <DashboardShell title="Acesso de Clientes" email="contato@exemplo.com.br" active="Acesso de Clientes">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <ClientAccessLists />
      </div>
    </DashboardShell>
  );
}
