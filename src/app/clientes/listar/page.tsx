import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ClientsList } from "@/components/sites/eagenda-com-br-a1f95f96/clientes-listar-43c58313/ClientsList";

// Clone of https://eagenda.com.br/clientes/listar?version=3 (empty list, like the live account).
export const metadata: Metadata = {
  title: "Listar Clientes - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function ClientsPage() {
  return (
    <DashboardShell title="Listar Clientes" email="contato@exemplo.com.br" active="Listar Clientes">
      <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-10 py-8 min-w-0">
        <ClientsList />
      </div>
    </DashboardShell>
  );
}
