import { Suspense } from "react";
import type { Metadata } from "next";
import { AppointmentsPageBody, AppointmentsRoute } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-listar-96e99b09/AppointmentsRoute";

// Clone of https://eagenda.com.br/agendamentos/listar/?version=3 (empty list, like the live account).
export const metadata: Metadata = {
  title: "Listar Agendamentos - Seiri",
};

// The static HTML is the plain list; the query (Confirmar Agendamentos) is applied in the browser.
export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsPageBody status="" interval="" />}>
      <AppointmentsRoute />
    </Suspense>
  );
}
