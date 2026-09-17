import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { BookingLinks } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-link_agendamento-4db1cfaa/BookingLinks";

// Clone of https://eagenda.com.br/agendamentos/link_agendamento/?version=3 (mock organisation slug).
export const metadata: Metadata = {
  title: "Links de Agendamento - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function BookingLinksPage() {
  return (
    <DashboardShell title="Links de Agendamento" email="contato@exemplo.com.br" active="Links de Agendamento">
      <BookingLinks />
    </DashboardShell>
  );
}
