import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ServicesPage } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-servicos-257f8795/ServicesPage";

// Clone of https://eagenda.com.br/agendamentos/servicos/?version=3 (an account with no services).
export const metadata: Metadata = {
  title: "Serviços - Seiri",
};

export default function ServicesRoute() {
  return (
    <DashboardShell title="Serviços" email="contato@exemplo.com.br" active="Serviços">
      <ServicesPage />
    </DashboardShell>
  );
}
