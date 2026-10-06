import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ClientImport } from "@/components/sites/eagenda-com-br-a1f95f96/users-clientes_autorizados-upload-9fe6d508/ClientImport";

// Clone of https://eagenda.com.br/users/clientes_autorizados/upload/?version=3 — "Importar Clientes".
export const metadata: Metadata = {
  title: "Importar Clientes - Seiri",
};

// The original highlights nothing in the menu on this page, so the shell gets no active entry.
export default function ClientImportRoute() {
  return (
    <DashboardShell title="Importar Clientes" email="contato@exemplo.com.br" active="">
      <ClientImport />
    </DashboardShell>
  );
}
