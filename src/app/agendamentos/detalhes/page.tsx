import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AppointmentDetails, AppointmentDetailsHeader } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-detalhes-b0a38a5f/AppointmentDetails";

// Clone of https://eagenda.com.br/agendamentos/detalhes/<id>?version=3. Same reason as the other
// pages keyed by a record: a static export cannot ship one page per appointment, so it reads ?id=.
export const metadata: Metadata = {
  title: "Detalhes do Agendamento - Seiri",
};

export default function AppointmentDetailsPage() {
  return (
    <DashboardShell
      header={
        <Suspense>
          <AppointmentDetailsHeader />
        </Suspense>
      }
      email="contato@exemplo.com.br"
      active="Agendamentos"
    >
      <Suspense>
        <AppointmentDetails />
      </Suspense>
    </DashboardShell>
  );
}
