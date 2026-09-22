import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { HolidaysPage } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-feriados-f3e1ba0f/HolidaysPage";

// Clone of https://eagenda.com.br/agendamentos/feriados/?version=3 (one mock agenda, empty holiday lists).
export const metadata: Metadata = {
  title: "Lista de Feriados - Seiri",
};

export default function HolidaysRoute() {
  return (
    <DashboardShell title="Feriados" email="contato@exemplo.com.br" active="Feriados">
      <HolidaysPage />
    </DashboardShell>
  );
}
