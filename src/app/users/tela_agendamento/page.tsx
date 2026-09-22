import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { BookingScreenSettings } from "@/components/sites/eagenda-com-br-a1f95f96/users-tela_agendamento-d0985e23/BookingScreenSettings";

// Clone of https://eagenda.com.br/users/tela_agendamento/?version=3 (mock business name and slug).
export const metadata: Metadata = {
  title: "Tela de Agendamento - Seiri",
};

export default function BookingScreenPage() {
  return (
    <DashboardShell title="Tela de Agendamento" email="contato@exemplo.com.br" active="Tela de Agendamento">
      <div id="page-content" className="relative mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <BookingScreenSettings />
      </div>
    </DashboardShell>
  );
}
