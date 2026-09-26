import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ClientDetails } from "@/components/sites/eagenda-com-br-a1f95f96/clientes-detalhes-df2cd359/ClientDetails";

// Clone of https://eagenda.com.br/clientes/<id>/?version=3. The original puts the client's id in the
// path; a static export can only ship pages it knows at build time, so here it is ?id=<client>.
export const metadata: Metadata = {
  title: "Detalhes do Cliente - Seiri",
};

export default function ClientDetailsPage() {
  return (
    <DashboardShell title="Detalhes do Cliente" email="contato@exemplo.com.br" active="Listar Clientes">
      <Suspense>
        <ClientDetails />
      </Suspense>
    </DashboardShell>
  );
}
