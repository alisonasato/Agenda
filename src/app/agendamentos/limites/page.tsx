import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { BookingLimits } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-limites-7f458758/BookingLimits";

// Clone of https://eagenda.com.br/agendamentos/limites/?version=3 (no limits configured, like the live account).
export const metadata: Metadata = {
  title: "Limites de Agendamentos - Seiri",
};

export default function BookingLimitsPage() {
  return (
    <DashboardShell title="Limites de Agendamentos" email="contato@exemplo.com.br" active="Limites de Agendamentos">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <BookingLimits />
      </div>
    </DashboardShell>
  );
}
