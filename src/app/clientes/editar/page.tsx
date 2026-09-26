import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ClientEditForm } from "@/components/sites/eagenda-com-br-a1f95f96/clientes-editar-27fb6236/ClientEditForm";

// Clone of https://eagenda.com.br/clientes/<id>/editar/?version=3. Same reason as the detail page:
// a static export cannot ship one page per client, so the client comes from ?id=.
export const metadata: Metadata = {
  title: "Editar Dados de Cadastro - Seiri",
};

export default function ClientEditPage() {
  return (
    <DashboardShell title="Editar Cliente" email="contato@exemplo.com.br" active="Listar Clientes">
      <Suspense>
        <ClientEditForm />
      </Suspense>
    </DashboardShell>
  );
}
